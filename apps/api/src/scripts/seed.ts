import { prisma } from "../prisma/client";

async function main() {
  // Patient test
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

  // Admin test
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

  // Praticien test
  const praticienUser = await prisma.user.upsert({
    where: { telephone: "+221770000002" },
    update: {},
    create: {
      telephone: "+221770000002",
      nom: "Diallo",
      prenom: "Aminata",
      role: "PRATICIEN",
      praticien: {
        create: {
          numeroOrdre: "INF-SN-2018-04821",
          anneesExperience: 8,
          bio: "Infirmière diplômée d'État avec 8 ans d'expérience à Dakar.",
          zoneIntervention: ["Almadies", "Mermoz", "Plateau"],
          statutCompte: "VALIDE",
          disponible: true,
          operateurMM: "WAVE",
          numeroMM: "+221770000002",
          specialites: {
            create: [{ specialite: "INFIRMIER", principale: true }],
          },
        },
      },
    },
  });

  console.log("✅ Seed OK :", {
    patient: patient.telephone,
    admin: admin.telephone,
    praticien: praticienUser.telephone,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());