import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedFunc = async () => {
  const exampleInsert: { name: string }[] = [
    { name: 'Trial 1' },
    { name: 'Trial 2' },
  ];

  const example = await prisma.example.createMany({
    data: exampleInsert,
  });

  console.log({ example }, 'Created Example Insert');
};

seedFunc()
  .catch((e) => {
    console.error(e, 'Error Seeding DB');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
