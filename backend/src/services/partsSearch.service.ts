import prisma from '../repositories/prisma.js';
import { Prisma } from '@prisma/client';

interface AdvancedSearchResult {
  totalCount: number;
  conditionBreakdown: Record<string, number>;
  priceStats: { avg: number; high: number; low: number };
  inventoryStats: { inStock: number; outOfStock: number; totalOnHand: number };
  parts: AdvancedPart[];
}

interface AdvancedPart {
  id: number;
  sku: string;
  name: string;
  condition: string;
  costCents: number | null;
  onHandQty: number;
  fitments: { id: number; vehicle: { id: number; year: number; make: string; model: string; trim: string | null } }[];
}

async function calculateOnHand(partIds: number[]): Promise<Map<number, number>> {
  if (partIds.length === 0) return new Map();

  // Sum qtyDelta grouped by partId — RECEIVE and RETURN are positive, FULFILL is negative
  // CORRECTION can be either. The qtyDelta already has the correct sign per the schema.
  const results = await prisma.inventoryEvent.groupBy({
    by: ['partId'],
    where: { partId: { in: partIds } },
    _sum: { qtyDelta: true },
  });

  const map = new Map<number, number>();
  for (const r of results) {
    map.set(r.partId, r._sum.qtyDelta || 0);
  }
  return map;
}

function buildStats(parts: AdvancedPart[]): Pick<AdvancedSearchResult, 'conditionBreakdown' | 'priceStats' | 'inventoryStats'> {
  const conditionBreakdown: Record<string, number> = {};
  let priceSum = 0;
  let priceCount = 0;
  let high = 0;
  let low = Infinity;
  let inStock = 0;
  let outOfStock = 0;
  let totalOnHand = 0;

  for (const p of parts) {
    conditionBreakdown[p.condition] = (conditionBreakdown[p.condition] || 0) + 1;

    if (p.costCents != null) {
      priceSum += p.costCents;
      priceCount++;
      if (p.costCents > high) high = p.costCents;
      if (p.costCents < low) low = p.costCents;
    }

    if (p.onHandQty > 0) {
      inStock++;
      totalOnHand += p.onHandQty;
    } else {
      outOfStock++;
    }
  }

  return {
    conditionBreakdown,
    priceStats: {
      avg: priceCount > 0 ? Math.round(priceSum / priceCount) : 0,
      high: high || 0,
      low: low === Infinity ? 0 : low,
    },
    inventoryStats: { inStock, outOfStock, totalOnHand },
  };
}

export async function advancedSearch(query?: string): Promise<AdvancedSearchResult> {
  const where: Prisma.PartWhereInput = query
    ? {
        OR: [
          { sku: { contains: query } },
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      }
    : {};

  const rawParts = await prisma.part.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      fitments: {
        include: { vehicle: true },
      },
    },
  });

  const partIds = rawParts.map((p) => p.id);
  const onHandMap = await calculateOnHand(partIds);

  const parts: AdvancedPart[] = rawParts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    condition: p.condition,
    costCents: p.costCents,
    onHandQty: onHandMap.get(p.id) || 0,
    fitments: p.fitments.map((f) => ({
      id: f.id,
      vehicle: f.vehicle,
    })),
  }));

  const stats = buildStats(parts);

  return {
    totalCount: parts.length,
    ...stats,
    parts,
  };
}

export async function getHierarchy() {
  const systems = await prisma.systemCode.findMany({ orderBy: { name: 'asc' } });
  const components = await prisma.componentCode.findMany({ orderBy: { name: 'asc' } });

  // Count parts per component by checking SKU contains system+component code
  const allParts = await prisma.part.findMany({ select: { sku: true } });

  const result = systems.map((sys) => {
    const sysComponents = components
      .filter((c) => c.systemCode === sys.code)
      .map((comp) => {
        const prefix = `${sys.code}${comp.code}`;
        const partCount = allParts.filter((p) => p.sku.includes(prefix)).length;
        return { code: comp.code, name: comp.name, partCount };
      });

    return {
      system: { code: sys.code, name: sys.name },
      components: sysComponents,
    };
  });

  return result;
}

export async function getPartsByHierarchy(systemCode: string, componentCode: string): Promise<AdvancedSearchResult> {
  const prefix = `${systemCode}${componentCode}`;

  const rawParts = await prisma.part.findMany({
    where: { sku: { contains: prefix } },
    orderBy: { createdAt: 'desc' },
    include: {
      fitments: {
        include: { vehicle: true },
      },
    },
  });

  const partIds = rawParts.map((p) => p.id);
  const onHandMap = await calculateOnHand(partIds);

  const parts: AdvancedPart[] = rawParts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    condition: p.condition,
    costCents: p.costCents,
    onHandQty: onHandMap.get(p.id) || 0,
    fitments: p.fitments.map((f) => ({
      id: f.id,
      vehicle: f.vehicle,
    })),
  }));

  const stats = buildStats(parts);

  return {
    totalCount: parts.length,
    ...stats,
    parts,
  };
}
