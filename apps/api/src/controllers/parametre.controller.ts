import { Request, Response } from 'express'
import { prisma } from '../prisma/client'

// GET /api/parametres — tous les paramètres
export async function getParametres(req: Request, res: Response): Promise<void> {
  const parametres = await prisma.parametre.findMany({
    orderBy: [{ categorie: 'asc' }, { cle: 'asc' }],
  })

  // Grouper par catégorie
  const grouped = parametres.reduce((acc, p) => {
    if (!acc[p.categorie]) acc[p.categorie] = {}
    acc[p.categorie][p.cle] = {
      valeur: p.type === 'boolean' ? p.valeur === 'true' : p.type === 'number' ? parseFloat(p.valeur) : p.valeur,
      label: p.label,
      description: p.description,
      type: p.type,
    }
    return acc
  }, {} as Record<string, Record<string, unknown>>)

  res.json({ grouped, raw: parametres })
}

// PATCH /api/parametres — mettre à jour plusieurs paramètres
export async function updateParametres(req: Request, res: Response): Promise<void> {
  const updates = req.body as Record<string, string | number | boolean>

  if (!updates || typeof updates !== 'object') {
    res.status(400).json({ error: 'Body invalide' })
    return
  }

  const results = await Promise.all(
    Object.entries(updates).map(([cle, valeur]) =>
      prisma.parametre.updateMany({
        where: { cle },
        data: { valeur: String(valeur) },
      })
    )
  )

  const updated = await prisma.parametre.findMany({
    orderBy: [{ categorie: 'asc' }, { cle: 'asc' }],
  })

  res.json({ message: `${results.length} paramètre(s) mis à jour`, parametres: updated })
}

// GET /api/parametres/:cle — un paramètre spécifique
export async function getParametre(req: Request, res: Response): Promise<void> {
  const { cle } = req.params

  const parametre = await prisma.parametre.findUnique({ where: { cle } })
  if (!parametre) {
    res.status(404).json({ error: 'Paramètre introuvable' })
    return
  }

  res.json(parametre)
}