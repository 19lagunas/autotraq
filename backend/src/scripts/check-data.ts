import prisma from '../repositories/prisma.js';

async function check() {
  const fitments = await prisma.partFitment.count();
  const groups = await prisma.interchangeGroup.count();
  const members = await prisma.interchangeGroupMember.count();
  const vehicles = await prisma.vehicle.count();
  const parts = await prisma.part.count();
  console.log(JSON.stringify({ fitments, groups, members, vehicles, parts }, null, 2));
  
  // Check sample fitments
  const sampleFitments = await prisma.partFitment.findMany({ take: 5, include: { part: { select: { name: true, sku: true } }, vehicle: { select: { year: true, make: true, model: true } } } });
  console.log('\nSample fitments:', JSON.stringify(sampleFitments, null, 2));
  
  // Check sample vehicles
  const sampleVehicles = await prisma.vehicle.findMany({ take: 5 });
  console.log('\nSample vehicles:', JSON.stringify(sampleVehicles, null, 2));
  
  // Check makes
  const makes = await prisma.vehicle.findMany({ select: { make: true }, distinct: ['make'] });
  console.log('\nMakes:', makes.map(m => m.make));
  
  await prisma.$disconnect();
}
check();
