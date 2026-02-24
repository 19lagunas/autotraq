import prisma from '../repositories/prisma.js';

export interface SolutionQuery {
  year: number;
  make: string;
  model: string;
  system?: string;      // SKU system code filter
  component?: string;   // SKU component code filter
  partName?: string;     // Text search
}

export interface SolutionResult {
  exact: any[];        // Parts that fit this exact vehicle
  interchange: any[];  // Parts from interchange groups that also fit other vehicles
  alternatives: any[]; // Other parts in the same category that fit similar vehicles
  query: {
    vehicle: string;
    matchedVehicleId: number | null;
    totalResults: number;
  };
}

/**
 * The Solution Engine — resolves a customer's vehicle + need into actionable part options.
 * 
 * Flow:
 * 1. Find the vehicle (or closest match)
 * 2. Find exact-fit parts via PartFitment
 * 3. Find interchange parts (same interchange group, fits other vehicles)
 * 4. Find alternatives (same category/system, fits similar vehicles from same make)
 */
export async function findSolutions(query: SolutionQuery): Promise<SolutionResult> {
  const vehicleLabel = `${query.year} ${query.make} ${query.model}`;

  // Step 1: Find the exact vehicle
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      year: query.year,
      make: { equals: query.make, mode: 'insensitive' },
      model: { equals: query.model, mode: 'insensitive' },
    },
  });

  if (!vehicle) {
    // Try to find similar vehicles (same make, nearby years)
    const similar = await prisma.vehicle.findMany({
      where: {
        make: { equals: query.make, mode: 'insensitive' },
        year: { gte: query.year - 3, lte: query.year + 3 },
      },
      take: 5,
      orderBy: { year: 'asc' },
    });

    return {
      exact: [],
      interchange: [],
      alternatives: [],
      query: {
        vehicle: vehicleLabel,
        matchedVehicleId: null,
        totalResults: 0,
      },
    };
  }

  // Step 2: Find exact-fit parts
  let exactWhere: any = { vehicleId: vehicle.id };
  const partWhere: any = {};
  
  if (query.partName) {
    partWhere.OR = [
      { name: { contains: query.partName, mode: 'insensitive' } },
      { description: { contains: query.partName, mode: 'insensitive' } },
    ];
  }
  if (query.system) {
    partWhere.sku = { startsWith: query.system };
  }

  const exactFitments = await prisma.partFitment.findMany({
    where: {
      vehicleId: vehicle.id,
      part: Object.keys(partWhere).length > 0 ? partWhere : undefined,
    },
    include: {
      part: {
        include: {
          inventoryEvents: {
            select: { quantity: true, type: true },
          },
          interchangeMembers: {
            include: {
              group: {
                include: {
                  members: {
                    include: {
                      part: {
                        include: {
                          fitments: {
                            include: { vehicle: true },
                            take: 10,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const exactParts = exactFitments.map(f => ({
    ...f.part,
    matchType: 'exact' as const,
    fitsVehicle: vehicleLabel,
    interchangeMembers: undefined,
    inventoryEvents: undefined,
    stockOnHand: calculateStock(f.part.inventoryEvents),
  }));

  // Step 3: Find interchange parts
  // Get all interchange group IDs for the exact-fit parts
  const exactPartIds = exactParts.map(p => p.id);
  const interchangeParts: any[] = [];

  if (exactPartIds.length > 0) {
    const interchangeMembers = await prisma.interchangeGroupMember.findMany({
      where: {
        group: {
          members: {
            some: { partId: { in: exactPartIds } },
          },
        },
        partId: { notIn: exactPartIds },
      },
      include: {
        part: {
          include: {
            fitments: {
              include: { vehicle: true },
              take: 5,
            },
            inventoryEvents: {
              select: { quantity: true, type: true },
            },
          },
        },
        group: { select: { name: true, description: true } },
      },
    });

    for (const member of interchangeMembers) {
      interchangeParts.push({
        ...member.part,
        matchType: 'interchange' as const,
        interchangeGroup: member.group.name,
        fitsVehicles: member.part.fitments.map(f => `${f.vehicle.year} ${f.vehicle.make} ${f.vehicle.model}`),
        fitments: undefined,
        inventoryEvents: undefined,
        stockOnHand: calculateStock(member.part.inventoryEvents),
      });
    }
  }

  // Step 4: Find alternatives — same category parts that fit vehicles from the same make
  const alternatives: any[] = [];
  
  if (exactParts.length > 0) {
    // Get the SKU prefixes (system+component) from exact matches to find similar parts
    const skuPrefixes = [...new Set(exactParts.map(p => {
      const parts = p.sku.split('-');
      return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : parts[0];
    }))];

    for (const prefix of skuPrefixes) {
      const altParts = await prisma.part.findMany({
        where: {
          sku: { startsWith: prefix },
          id: { notIn: [...exactPartIds, ...interchangeParts.map(p => p.id)] },
          fitments: {
            some: {
              vehicle: {
                make: { equals: query.make, mode: 'insensitive' },
              },
            },
          },
        },
        include: {
          fitments: {
            include: { vehicle: true },
            take: 5,
          },
          inventoryEvents: {
            select: { quantity: true, type: true },
          },
        },
        take: 10,
      });

      for (const part of altParts) {
        alternatives.push({
          ...part,
          matchType: 'alternative' as const,
          fitsVehicles: part.fitments.map(f => `${f.vehicle.year} ${f.vehicle.make} ${f.vehicle.model}`),
          fitments: undefined,
          inventoryEvents: undefined,
          stockOnHand: calculateStock(part.inventoryEvents),
        });
      }
    }
  } else if (query.partName) {
    // No exact match for vehicle, but search by part name across same make
    const searchParts = await prisma.part.findMany({
      where: {
        OR: [
          { name: { contains: query.partName, mode: 'insensitive' } },
          { description: { contains: query.partName, mode: 'insensitive' } },
        ],
        fitments: {
          some: {
            vehicle: {
              make: { equals: query.make, mode: 'insensitive' },
            },
          },
        },
      },
      include: {
        fitments: {
          include: { vehicle: true },
          take: 5,
        },
        inventoryEvents: {
          select: { quantity: true, type: true },
        },
      },
      take: 20,
    });

    for (const part of searchParts) {
      alternatives.push({
        ...part,
        matchType: 'alternative' as const,
        fitsVehicles: part.fitments.map(f => `${f.vehicle.year} ${f.vehicle.make} ${f.vehicle.model}`),
        fitments: undefined,
        inventoryEvents: undefined,
        stockOnHand: calculateStock(part.inventoryEvents),
      });
    }
  }

  const totalResults = exactParts.length + interchangeParts.length + alternatives.length;

  return {
    exact: exactParts,
    interchange: interchangeParts,
    alternatives,
    query: {
      vehicle: vehicleLabel,
      matchedVehicleId: vehicle.id,
      totalResults,
    },
  };
}

function calculateStock(events: { quantity: number; type: string }[]): number {
  return events.reduce((sum, e) => {
    if (e.type === 'RECEIVE' || e.type === 'RETURN' || e.type === 'CORRECTION') {
      return sum + e.quantity;
    }
    if (e.type === 'FULFILL') {
      return sum - e.quantity;
    }
    return sum;
  }, 0);
}

/**
 * Get available makes for the vehicle picker
 */
export async function getAvailableMakes(): Promise<string[]> {
  const makes = await prisma.vehicle.findMany({
    select: { make: true },
    distinct: ['make'],
    orderBy: { make: 'asc' },
  });
  return makes.map(m => m.make);
}

/**
 * Get models for a given make
 */
export async function getModelsByMake(make: string): Promise<string[]> {
  const models = await prisma.vehicle.findMany({
    where: { make: { equals: make, mode: 'insensitive' } },
    select: { model: true },
    distinct: ['model'],
    orderBy: { model: 'asc' },
  });
  return models.map(m => m.model);
}

/**
 * Get years for a given make + model
 */
export async function getYearsByMakeModel(make: string, model: string): Promise<number[]> {
  const years = await prisma.vehicle.findMany({
    where: {
      make: { equals: make, mode: 'insensitive' },
      model: { equals: model, mode: 'insensitive' },
    },
    select: { year: true },
    distinct: ['year'],
    orderBy: { year: 'desc' },
  });
  return years.map(y => y.year);
}
