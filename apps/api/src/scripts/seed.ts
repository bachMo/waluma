import { prisma } from "../prisma/client";

async function main() {
  // Créer un patient test
  const patient = await prisma.user.upsert({
    where: { telephone: "+221770000001" },
    update: {},
    create: {
      telephone: "+221770000001",
      nom: "Ndiaye",
      prenom: "Fatou",
      role: "PATIENT",
    },
  });

  // Créer un admin test
  const admin = await prisma.user.upsert({
    where: { telephone: "+221770000099" },
    update: {},
    create: {
      telephone: "+221770000099",
      nom: "Sané",
      prenom: "Bacary",
      role: "ADMIN",
      admin: { create: { superAdmin: true } },
    },
  });

  console.log("✅ Seed OK :", { patient: patient.telephone, admin: admin.telephone });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());