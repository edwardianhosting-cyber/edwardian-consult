const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const password = 'Admin@123';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@edwardianconsult.com' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@edwardianconsult.com',
      phone: '08000000000',
      passwordHash,
      role: 'ADMIN',
      portalId: 'EIEC/ADMIN/001',
      parentAccessCode: 'PAR-ADMIN-001',
      isActive: true,
    },
  });

  console.log('Admin ready');
  console.log('Email:', admin.email);
  console.log('Password:', password);
  console.log('Portal ID:', admin.portalId);
}

main()
  .catch((e) => {
    console.error('Failed to create admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
