import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_EMAIL = 'shayeasesolutions@gmail.com';

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: TARGET_EMAIL },
    select: { id: true, fullName: true, email: true },
  });

  if (!user) {
    console.log(`No user found with email: ${TARGET_EMAIL}`);
    return;
  }

  const deletedAttempts = await prisma.mockExamAttempt.deleteMany({
    where: { userId: user.id },
  });

  const deletedResults = await prisma.cbtResult.deleteMany({
    where: { userId: user.id, type: 'MOCK' },
  });

  console.log('User:', user.fullName, user.email);
  console.log('Deleted mock attempts:', deletedAttempts.count);
  console.log('Deleted mock results:', deletedResults.count);
}

main()
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
