import prisma from '../repositories/prisma.js';

async function fix() {
  const emails = ['ben@autotraq.app', 'gus@autotraq.app', 'dean@autotraq.app', 'fatima@autotraq.app'];
  for (const email of emails) {
    const u = await prisma.user.updateMany({ where: { email }, data: { role: 'manager' } });
    console.log(email, '→ manager', u.count ? '✅' : '⚠️ not found');
  }
  // Demote test account if exists
  await prisma.user.updateMany({ where: { email: 'admin@test.com' }, data: { role: 'viewer' } });
  
  const all = await prisma.user.findMany({ select: { email: true, role: true }, orderBy: { email: 'asc' } });
  console.log('\nCurrent users:', all);
  await prisma.$disconnect();
}
fix();
