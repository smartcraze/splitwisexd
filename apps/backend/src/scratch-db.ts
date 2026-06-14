import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";

async function main() {
  const usersToCreate = [
    { name: "Aisha", email: "aisha@example.com" },
    { name: "Rohan", email: "rohan@example.com" },
    { name: "Priya", email: "priya@example.com" },
    { name: "Meera", email: "meera@example.com" },
    { name: "Sam", email: "sam@example.com" },
    { name: "Dev", email: "dev@example.com" },
  ];

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  for (const u of usersToCreate) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email }
    });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          passwordHash: passwordHash
        }
      });
      console.log(`Created user ${u.name}`);
    } else {
      console.log(`User ${u.name} already exists`);
    }
  }

  console.log("Done seeding users!");
}

main().catch(console.error);
