import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

// GET /api/stats/dashboard
export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  const [
    totalMissions,
    missionsActives,
    totalPraticiens,
    praticiensActifs,
    praticiensAValider,
    totalLitiges,
    litigesOuverts,
    totalPatients,
    missionsCeMois,
    topPraticiens,
    repartitionSpecialites,
  ] = await Promise.all([
    prisma.mission.count(),
    prisma.mission.count({
      where: { statut: { in: ['ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS'] } },
    }),
    prisma.praticien.count(),
    prisma.praticien.count({ where: { statutCompte: 'VALIDE', disponible: true } }),
    prisma.praticien.count({ where: { statutCompte: 'EN_ATTENTE' } }),
    prisma.litige.count(),
    prisma.litige.count({ where: { statut: 'OUVERT' } }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.mission.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.praticien.findMany({
      where: { statutCompte: 'VALIDE' },
      orderBy: [{ noteMoyenne: 'desc' }, { totalMissions: 'desc' }],
      take: 3,
      include: {
        user: { select: { nom: true, prenom: true } },
        specialites: { where: { principale: true } },
      },
    }),
    prisma.mission.groupBy({
      by: ['specialite'],
      _count: { specialite: true },
      orderBy: { _count: { specialite: 'desc' } },
    }),
  ])

  // Volume financier ce mois
  const paiementsCeMois = await prisma.paiement.aggregate({
    where: {
      statut: 'PAYE',
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: { montant: true },
  })

  // Missions par jour ce mois (pour graphique)
  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const missionsByDay = await prisma.mission.findMany({
    where: { createdAt: { gte: debutMois } },
    select: { createdAt: true },
  })

  // Grouper par jour
  const dayMap: Record<string, number> = {}
  missionsByDay.forEach(m => {
    const day = m.createdAt.getDate().toString()
    dayMap[day] = (dayMap[day] || 0) + 1
  })

  const graphiqueMissions = Object.entries(dayMap)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([jour, count]) => ({ jour, missions: count }))

  res.json({
    kpis: {
      totalMissions,
      missionsActives,
      missionsCeMois,
      totalPraticiens,
      praticiensActifs,
      praticiensAValider,
      totalLitiges,
      litigesOuverts,
      totalPatients,
      volumeCeMois: paiementsCeMois._sum.montant || 0,
    },
    topPraticiens: topPraticiens.map(p => ({
      nom: `${p.user.prenom} ${p.user.nom}`,
      missions: p.totalMissions,
      note: p.noteMoyenne,
      specialite: p.specialites[0]?.specialite,
    })),
    repartitionSpecialites: repartitionSpecialites.map(r => ({
      specialite: r.specialite,
      count: r._count.specialite,
    })),
    graphiqueMissions,
  })
}

// GET /api/stats/badges — compteurs pour la sidebar
export async function getBadges(req: Request, res: Response): Promise<void> {
  const [praticiensEnAttente, missionsActives, litigesOuverts] = await Promise.all([
    prisma.praticien.count({ where: { statutCompte: 'EN_ATTENTE' } }),
    prisma.mission.count({ where: { statut: { in: ['EN_ATTENTE', 'ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS'] } } }),
    prisma.litige.count({ where: { statut: 'OUVERT' } }),
  ])
  res.json({ praticiensEnAttente, missionsActives, litigesOuverts })
}