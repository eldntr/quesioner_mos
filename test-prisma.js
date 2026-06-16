const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient({
  errorFormat: 'pretty',
  log: ['error']
});

async function main() {
  try {
    const evaluators = await prisma.evaluator.findMany();
    console.log("Connected successfully! Evaluators:", evaluators);
  } catch (error) {
    console.error("Prisma Connection Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
