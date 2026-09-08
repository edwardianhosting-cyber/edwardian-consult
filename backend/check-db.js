const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Attempting DB connection...');
    await prisma.user.count();
    console.log('DB connection: OK');
  } catch (err) {
    console.error('DB connection failed:', err.message);
  }
}

test();
