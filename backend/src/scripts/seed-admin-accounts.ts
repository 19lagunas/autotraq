import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_ACCOUNTS = [
  { email: 'anson@autotraq.com', name: 'Anson', role: 'admin' as const },
  { email: 'team1@autotraq.com', name: 'TeamMember1', role: 'admin' as const },
  { email: 'team2@autotraq.com', name: 'TeamMember2', role: 'admin' as const },
  { email: 'team3@autotraq.com', name: 'TeamMember3', role: 'admin' as const },
  { email: 'team4@autotraq.com', name: 'TeamMember4', role: 'admin' as const },
];

const DEFAULT_PASSWORD = 'autotraq2026';

async function main() {
  console.log('🌱 Seeding admin accounts...\n');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const account of ADMIN_ACCOUNTS) {
    const existing = await prisma.user.findUnique({
      where: { email: account.email },
    });

    if (existing) {
      console.log(`⏭️  Skipped: ${account.email} (already exists)`);
      continue;
    }

    await prisma.user.create({
      data: {
        email: account.email,
        name: account.name,
        password: hashedPassword,
        role: account.role,
      },
    });

    console.log(`✅ Created: ${account.email} (${account.name})`);
  }

  console.log('\n🎉 Admin seeding complete!');
  console.log(`   Default password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
