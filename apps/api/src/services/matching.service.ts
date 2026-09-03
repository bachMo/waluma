import { prisma } from '../prisma/client'

interface MatchingOptions {
  specialite: string
  latitude?: number
  longitude?: number
  urgence?: boolean
  rayonKm?: number
}

export async function findBestPraticien(options: MatchingOptions) {
  const { specialite, urgence = false, rayonKm = 10 } = options

  const praticiens = await prisma.praticien.findMany({
    where: {
      statutCompte: 'VALIDE',
      disponible: true,
      specialites: urgence
        ? undefined
        : { some: { specialite: specialite as never } },
    },
    include: {
      user: { select: { nom: true, prenom: true, telephone: true } },
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