// backend/scripts/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding sample contact...");
  const c = await prisma.contact.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      phone: "+1 555 555 5555",
      company: "Acme",
      employees: "1-10",
      inquiry: "General product information",
      message: "Seeded contact",
      marketingOk: false
    }
  });
  console.log("Created contact id:", c.id);
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit());
