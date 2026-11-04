import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@prisma/client';

const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

if (!email) {
  // eslint-disable-next-line no-console
  console.error('SUPER_ADMIN_EMAIL is required for the Vercel deployment.');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  await prisma.user.upsert({
    where: { email },
    update: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
    create: {
      fullName: 'ClubsHub Super Admin',
      email,
      studentRegistrationId: `super-admin-${randomUUID()}`,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  // eslint-disable-next-line no-console
  console.log('Super-admin account seeded from SUPER_ADMIN_EMAIL.');
} finally {
  await prisma.$disconnect();
}
