import { prisma } from '../prisma/client'

interface MatchingOptions {
  specialite: string
  latitude?: number
  longitude?: number
  urgence?: boolean
  rayonKm?: number
  excludePraticienIds?: string[]
}

export async function findBestPraticien(options: MatchingOptions) {
  const { specialite, urgence = false, rayonKm = 10, excludePraticienIds = [] } = options

  // Trouver les praticiens avec des missions terminées non payées
const praticiensBloques = await prisma.$queryRaw<{ praticienId: string }[]>`
  SELECT DISTINCT m."praticienId"
  FROM missions m
  LEFT JOIN paiements p ON p."missionId" = m.id
  WHERE m.statut = 'TERMINEE'
    AND m."praticienId" IS NOT NULL
    AND (p.id IS NULL OR p.statut != 'PAYE')
`

const idsExclus = [
  ...excludePraticienIds,
  ...praticiensBloques.map(r => r.praticienId),
]

  const praticiens = await prisma.praticien.findMany({
    where: {
      statutCompte: 'VALIDE',
      disponible: true,
      bloque: false,
      id: idsExclus.length > 0 ? { notIn: idsExclus } : undefined,
      specialites: urgence
        ? undefined
        : { some: { specialite: specialite as never } },
    },
    include: {
      user: { select: { id: true, nom: true, prenom: true, telephone: true } },
      specialites: true,
    },
    orderBy: [
      { noteMoyenne: 'desc' },
      { tauxAcceptation: 'desc' },
    ],
  })

  if (praticiens.length === 0) return null

  if (options.latitude && options.longitude) {
    const filteredByDistance = praticiens.filter(p => {
      if (!p.latitudeActuelle || !p.longitudeActuelle) return true
      const dist = haversineKm(
        options.latitude!, options.longitude!,
        p.latitudeActuelle, p.longitudeActuelle
      )
      return dist <= rayonKm
    })
    if (filteredByDistance.length > 0) return filteredByDistance[0]
  }

  return praticiens[0]
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}