// Quick test script to check database connectivity
const { PrismaClient } = require('@prisma/client');

async function test() {
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
    log: ['error'],
  });
  try {
    const result = await prisma.cbtResult.findMany({ take: 1 });
    console.log('Connected! Found CbtResult count:', result.length);
    await prisma.$disconnect();
    process.exit(0);
  } catch(e) {
    console.error('Connection failed:', e.message || e);
    await prisma.$disconnect();
    process.exit(1);
  }
}

test();
