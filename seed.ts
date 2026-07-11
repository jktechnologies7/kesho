import { prisma } from "../src/lib/prisma";

/**
 * Seed script stub. Demo wallet/transaction/bill/savings seed data is
 * added once those tables exist (Database module, Part 3).
 */
async function main() {
  console.log("No seed data yet — this is populated in the Database module (Part 3).");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
