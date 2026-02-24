/**
 * Seed Admin Accounts
 * Creates default admin accounts for the AutoTraQ team.
 * Idempotent — skips users that already exist (matched by email).
 *
 * Usage: npm run db:seed-admins
 */

import bcrypt from 'bcrypt';
import prisma from '../repositories/prisma.js';

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'autotraq2026';

const ADMIN_ACCOUNTS = [
  { email: 'acordeiro@autotraq.app', name: 'Anson Cordeiro', role: 'admin' as const },
  { email: 'ben@autotraq.app',      name: 'Ben',             role: 'admin' as const },
  { email: 'gus@autotraq.app',      name: 'Gus',             role: 'admin' as const },
  { email: 'dean@autotraq.app',     name: 'Dean',            role: 'admin' as const },
  { email: 'fatima@autotraq.app',   name: 'Fatima',          role: 'admin' as const },
];

async function main() {
  console.log('🌱 Seeding admin accounts...\n');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

  for (const account of ADMIN_ACCOUNTS) {
    const existing = await prisma.user.findUnique({ where: { email: account.email } });

    if (existing) {
      console.log(`  ⏭  ${account.email} — already exists (id: ${existing.id}), skipping`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: account.email,
        name: account.name,
        password: hashedPassword,
        role: account.role,
      },
    });

    console.log(`  ✅ ${account.email} — created (id: ${user.id})`);
  }

  console.log('\n🎉 Admin seed complete!');
  console.log(`   Default password: ${DEFAULT_PASSWORD}`);
  console.log('   ⚠️  Change passwords after first login.\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
