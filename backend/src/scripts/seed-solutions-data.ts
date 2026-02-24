/**
 * Seed realistic vehicles, fitments, and interchange groups
 * for the Solution Finder feature.
 */
import prisma from '../repositories/prisma.js';

const VEHICLES = [
  // Ford F-Series
  { year: 2000, make: 'Ford', model: 'F-150', trim: 'XLT' },
  { year: 2001, make: 'Ford', model: 'F-150', trim: 'XLT' },
  { year: 2002, make: 'Ford', model: 'F-150', trim: 'XLT' },
  { year: 2003, make: 'Ford', model: 'F-150', trim: 'XLT' },
  { year: 2002, make: 'Ford', model: 'F-150', trim: 'Lariat' },
  { year: 2002, make: 'Ford', model: 'F-250', trim: 'XLT' },
  { year: 2002, make: 'Ford', model: 'Expedition', trim: 'XLT' },
  { year: 2003, make: 'Ford', model: 'Expedition', trim: 'Eddie Bauer' },
  // Toyota
  { year: 2018, make: 'Toyota', model: 'Camry', trim: 'LE' },
  { year: 2019, make: 'Toyota', model: 'Camry', trim: 'SE' },
  { year: 2020, make: 'Toyota', model: 'Camry', trim: 'XSE' },
  { year: 2019, make: 'Toyota', model: 'Corolla', trim: 'LE' },
  { year: 2020, make: 'Toyota', model: 'Corolla', trim: 'SE' },
  { year: 2020, make: 'Toyota', model: 'RAV4', trim: 'XLE' },
  { year: 2021, make: 'Toyota', model: 'RAV4', trim: 'XLE' },
  // Honda
  { year: 2000, make: 'Honda', model: 'Civic', trim: 'EX' },
  { year: 2018, make: 'Honda', model: 'Civic', trim: 'EX' },
  { year: 2019, make: 'Honda', model: 'Civic', trim: 'Sport' },
  { year: 2020, make: 'Honda', model: 'Civic', trim: 'EX' },
  { year: 2019, make: 'Honda', model: 'Accord', trim: 'EX-L' },
  { year: 2020, make: 'Honda', model: 'Accord', trim: 'Sport' },
  { year: 2020, make: 'Honda', model: 'CR-V', trim: 'EX' },
  // Chevy
  { year: 2018, make: 'Chevrolet', model: 'Silverado 1500', trim: 'LT' },
  { year: 2019, make: 'Chevrolet', model: 'Silverado 1500', trim: 'LT' },
  { year: 2020, make: 'Chevrolet', model: 'Silverado 1500', trim: 'RST' },
  { year: 2019, make: 'Chevrolet', model: 'Tahoe', trim: 'LT' },
  { year: 2020, make: 'Chevrolet', model: 'Equinox', trim: 'LT' },
  // Nissan
  { year: 2019, make: 'Nissan', model: 'Altima', trim: 'SV' },
  { year: 2020, make: 'Nissan', model: 'Altima', trim: 'SL' },
  { year: 2020, make: 'Nissan', model: 'Rogue', trim: 'SV' },
];

// Parts to create with fitments — keyed by a search-friendly name
// Each part lists which vehicle indices it fits
const PARTS_WITH_FITMENTS: { name: string; sku: string; desc: string; condition: string; costCents: number; vehicleIndices: number[] }[] = [
  // Ford F-150 parts
  { name: 'Tail Light Assembly - Driver Side', sku: 'FRD-F15-EXT-TLA-N', desc: 'OEM replacement tail light assembly, driver side. Fits 2000-2003 Ford F-150.', condition: 'NEW', costCents: 8999, vehicleIndices: [0,1,2,3,4] },
  { name: 'Tail Light Assembly - Passenger Side', sku: 'FRD-F15-EXT-TLB-N', desc: 'OEM replacement tail light assembly, passenger side. Fits 2000-2003 Ford F-150.', condition: 'NEW', costCents: 8999, vehicleIndices: [0,1,2,3,4] },
  { name: 'Tail Light Assembly - Driver Side (Used)', sku: 'FRD-F15-EXT-TLA-U', desc: 'Used OEM tail light assembly, driver side. Good condition, tested.', condition: 'GOOD', costCents: 3499, vehicleIndices: [0,1,2,3,4] },
  { name: 'LED Tail Light Upgrade Kit', sku: 'FRD-F15-EXT-TLU-N', desc: 'Aftermarket LED tail light conversion kit. Brighter, modern look. Fits 2000-2003 F-150.', condition: 'NEW', costCents: 14999, vehicleIndices: [0,1,2,3,4] },
  { name: 'Brake Pad Set - Front', sku: 'FRD-F15-BRK-FPD-N', desc: 'Ceramic front brake pads. Fits 2000-2003 Ford F-150 and 2002-2003 Expedition.', condition: 'NEW', costCents: 4499, vehicleIndices: [0,1,2,3,4,6,7] },
  { name: 'Brake Rotor - Front (Pair)', sku: 'FRD-F15-BRK-FRT-N', desc: 'Premium front brake rotors, pair. Fits 2000-2003 F-150.', condition: 'NEW', costCents: 7999, vehicleIndices: [0,1,2,3,4] },
  { name: 'Alternator 130A', sku: 'FRD-F15-ENG-ALT-N', desc: 'OEM replacement alternator, 130 amp. Fits 2000-2003 F-150 4.6L/5.4L.', condition: 'NEW', costCents: 18999, vehicleIndices: [0,1,2,3,4] },
  { name: 'Alternator 130A (Refurbished)', sku: 'FRD-F15-ENG-ALT-R', desc: 'Professionally refurbished alternator. Tested, 1-year warranty.', condition: 'EXCELLENT', costCents: 9999, vehicleIndices: [0,1,2,3,4] },
  { name: 'Headlight Assembly - Driver Side', sku: 'FRD-F15-EXT-HLA-N', desc: 'OEM headlight assembly. Fits 2000-2003 Ford F-150.', condition: 'NEW', costCents: 11999, vehicleIndices: [0,1,2,3,4] },
  { name: 'Starter Motor', sku: 'FRD-F15-ENG-STR-N', desc: 'OEM replacement starter motor. Fits F-150 and Expedition with 4.6L/5.4L.', condition: 'NEW', costCents: 14999, vehicleIndices: [0,1,2,3,4,6,7] },
  { name: 'Radiator', sku: 'FRD-F15-CLG-RAD-N', desc: 'Aluminum/plastic radiator. Fits 2000-2003 F-150 all engines.', condition: 'NEW', costCents: 12999, vehicleIndices: [0,1,2,3,4] },
  { name: 'Door Mirror - Driver Side', sku: 'FRD-F15-EXT-MLA-U', desc: 'Used OEM power mirror, driver side. Black, manual fold.', condition: 'GOOD', costCents: 4999, vehicleIndices: [2,3,4] },

  // Ford F-250 / Expedition shared parts
  { name: 'Transmission Mount', sku: 'FRD-F25-TRN-MNT-N', desc: 'Transmission mount. Fits F-250 Super Duty and Expedition.', condition: 'NEW', costCents: 3999, vehicleIndices: [5,6,7] },

  // Toyota Camry parts
  { name: 'Brake Pad Set - Front', sku: 'TOY-CAM-BRK-FPD-N', desc: 'Ceramic front brake pads for 2018-2020 Toyota Camry.', condition: 'NEW', costCents: 3999, vehicleIndices: [8,9,10] },
  { name: 'Air Filter', sku: 'TOY-CAM-ENG-AFI-N', desc: 'Engine air filter. Fits 2018-2020 Camry 2.5L.', condition: 'NEW', costCents: 1999, vehicleIndices: [8,9,10] },
  { name: 'Headlight Assembly - LED', sku: 'TOY-CAM-EXT-HLA-N', desc: 'OEM LED headlight assembly. Fits 2018-2020 Camry.', condition: 'NEW', costCents: 29999, vehicleIndices: [8,9,10] },
  { name: 'Tail Light Assembly', sku: 'TOY-CAM-EXT-TLA-N', desc: 'OEM tail light. Fits 2018-2020 Camry.', condition: 'NEW', costCents: 15999, vehicleIndices: [8,9,10] },

  // Toyota Corolla parts
  { name: 'Brake Pad Set - Front', sku: 'TOY-COR-BRK-FPD-N', desc: 'Front brake pads for 2019-2020 Toyota Corolla.', condition: 'NEW', costCents: 3499, vehicleIndices: [11,12] },
  { name: 'Cabin Air Filter', sku: 'TOY-COR-CLM-CAF-N', desc: 'Cabin air filter. Fits 2019-2020 Corolla.', condition: 'NEW', costCents: 1499, vehicleIndices: [11,12] },

  // Honda Civic parts
  { name: 'Brake Pad Set - Front', sku: 'HON-CIV-BRK-FPD-N', desc: 'Ceramic front brake pads. Fits 2018-2020 Honda Civic.', condition: 'NEW', costCents: 3299, vehicleIndices: [16,17,18] },
  { name: 'Alternator', sku: 'HON-CIV-ENG-ALT-N', desc: 'OEM alternator for 2018-2020 Civic 1.5T and 2.0L.', condition: 'NEW', costCents: 22999, vehicleIndices: [16,17,18] },
  { name: 'Headlight Assembly - Driver', sku: 'HON-CIV-EXT-HLA-N', desc: 'Halogen headlight assembly. 2018-2020 Civic.', condition: 'NEW', costCents: 18999, vehicleIndices: [16,17,18] },

  // Chevy Silverado parts
  { name: 'Tail Light Assembly - Driver', sku: 'CHV-SLV-EXT-TLA-N', desc: 'OEM tail light. Fits 2018-2020 Silverado 1500.', condition: 'NEW', costCents: 12999, vehicleIndices: [22,23,24] },
  { name: 'Brake Pad Set - Front', sku: 'CHV-SLV-BRK-FPD-N', desc: 'Heavy-duty front brake pads. Fits 2018-2020 Silverado 1500 and Tahoe.', condition: 'NEW', costCents: 5499, vehicleIndices: [22,23,24,25] },
  { name: 'LED Light Bar (Aftermarket)', sku: 'CHV-SLV-EXT-LBA-N', desc: '42" curved LED light bar. Universal mount for Silverado.', condition: 'NEW', costCents: 19999, vehicleIndices: [22,23,24] },
];

// Interchange groups — parts that are interchangeable
const INTERCHANGE_GROUPS = [
  {
    name: 'Ford F-150/Expedition Brake Pads (2000-2003)',
    description: 'Front brake pads that fit both F-150 and Expedition platforms',
    partSkus: ['FRD-F15-BRK-FPD-N'],
  },
  {
    name: 'Ford F-150 Tail Light Assembly (2000-2003)',
    description: 'Driver side tail lights — OEM, used, and LED upgrade are interchangeable mounting',
    partSkus: ['FRD-F15-EXT-TLA-N', 'FRD-F15-EXT-TLA-U', 'FRD-F15-EXT-TLU-N'],
  },
  {
    name: 'Ford F-150 Alternator (2000-2003)',
    description: 'New and refurbished alternators — same mounting and electrical spec',
    partSkus: ['FRD-F15-ENG-ALT-N', 'FRD-F15-ENG-ALT-R'],
  },
  {
    name: 'Chevy Silverado/Tahoe Brake Pads (2018-2020)',
    description: 'Front brake pads shared between Silverado and Tahoe',
    partSkus: ['CHV-SLV-BRK-FPD-N'],
  },
];

async function main() {
  console.log('🚗 Seeding Solution Finder data...\n');

  // 1. Create vehicles (skip existing)
  const vehicleMap: Record<string, number> = {};
  for (const v of VEHICLES) {
    const key = `${v.year}-${v.make}-${v.model}-${v.trim}`;
    const existing = await prisma.vehicle.findFirst({
      where: { year: v.year, make: v.make, model: v.model, trim: v.trim },
    });
    if (existing) {
      vehicleMap[key] = existing.id;
      console.log(`  ⏭  Vehicle: ${key} (id: ${existing.id})`);
    } else {
      const created = await prisma.vehicle.create({ data: v });
      vehicleMap[key] = created.id;
      console.log(`  ✅ Vehicle: ${key} (id: ${created.id})`);
    }
  }

  // 2. Create parts + fitments
  const partMap: Record<string, number> = {};
  for (const p of PARTS_WITH_FITMENTS) {
    let part = await prisma.part.findUnique({ where: { sku: p.sku } });
    if (!part) {
      part = await prisma.part.create({
        data: {
          name: p.name,
          sku: p.sku,
          description: p.desc,
          condition: p.condition as any,
          costCents: p.costCents,
        },
      });
      console.log(`  ✅ Part: ${p.sku} — ${p.name}`);
    } else {
      console.log(`  ⏭  Part: ${p.sku} (exists)`);
    }
    partMap[p.sku] = part.id;

    // Create fitments
    for (const vi of p.vehicleIndices) {
      const v = VEHICLES[vi];
      const key = `${v.year}-${v.make}-${v.model}-${v.trim}`;
      const vehicleId = vehicleMap[key];
      if (!vehicleId) continue;
      
      const existing = await prisma.partFitment.findFirst({
        where: { partId: part.id, vehicleId },
      });
      if (!existing) {
        await prisma.partFitment.create({ data: { partId: part.id, vehicleId } });
      }
    }
  }

  // 3. Create interchange groups
  for (const g of INTERCHANGE_GROUPS) {
    let group = await prisma.interchangeGroup.findFirst({ where: { name: g.name } });
    if (!group) {
      group = await prisma.interchangeGroup.create({
        data: { name: g.name, description: g.description },
      });
      console.log(`  ✅ Interchange: ${g.name}`);
    } else {
      console.log(`  ⏭  Interchange: ${g.name} (exists)`);
    }

    for (const sku of g.partSkus) {
      const partId = partMap[sku];
      if (!partId) continue;
      const existing = await prisma.interchangeGroupMember.findFirst({
        where: { groupId: group.id, partId },
      });
      if (!existing) {
        await prisma.interchangeGroupMember.create({ data: { groupId: group.id, partId } });
      }
    }
  }

  console.log('\n🎉 Solution Finder seed complete!');
  console.log(`   ${VEHICLES.length} vehicles, ${PARTS_WITH_FITMENTS.length} parts, ${INTERCHANGE_GROUPS.length} interchange groups`);
  await prisma.$disconnect();
}

main().catch(e => { console.error('Seed failed:', e); process.exit(1); });
