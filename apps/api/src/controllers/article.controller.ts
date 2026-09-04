import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { AuthRequest } from '../middlewares/auth.middleware'
import { uploadFile } from '../services/r2.service'

// GET /api/articles — liste publique
export async function listArticles(req: Request, res: Response): Promise<void> {
  const { categorie, statut, page = '1', limit = '20' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const where: Record<string, unknown> = {}
  if (categorie) where.categorie = categorie
  if (statut) where.statut = statut
  else where.statut = 'publié' // Par défaut : articles publiés uniquement

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.article.count({ where }),
  ])

  res.json({ articles, total, page: parseInt(page as string) })
}

// GET /api/articles/admin — liste complète pour admin (brouillons inclus)
export async function listArticlesAdmin(req: Request, res: Response): Promise<void> {
  const { categorie, statut, page = '1', limit = '50' } = req.query
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

  const where: Record<string, unknown> = {}
  if (categorie) where.categorie = categorie
  if (statut) where.statut = statut

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.article.count({ where }),
  ])

  res.json({ articles, total, page: parseInt(page as string) })
}

// GET /api/articles/:id — détail
export async function getArticle(req: Request, res: Response): Promise<void> {
  const { id } = req.params

  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) {
    res.status(404).json({ error: 'Article introuvable' })
    return
  }

  // Incrémenter le compteur de vues
  await prisma.article.update({
    where: { id },
    data: { vues: { increment: 1 } },
  })

  res.json(article)
}

// POST /api/articles — créer un article (admin)
export async function creerArticle(req: AuthRequest, res: Response): Promise<void> {
  const { titre, contenu, categorie, auteur, statut = 'brouillon', imageUrl } = req.body

  if (!titre || !contenu || !categorie || !auteur) {
    res.status(400).json({ error: 'Titre, contenu, catégorie et auteur obligatoires' })
    return
  }

  const article = await prisma.article.create({
    data: { titre, contenu, categorie, auteur, statut, imageUrl },
  })

  res.status(201).json(article)
}

// PATCH /api/articles/:id — modifier un article (admin)
export async function updateArticle(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params
  const { titre, contenu, categorie, auteur, statut, imageUrl } = req.body

  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) {
    res.status(404).json({ error: 'Article introuvable' })
    return
  }

  const updated = await prisma.article.update({
    where: { id },
    data: {
      ...(titre && { titre }),
      ...(contenu && { contenu }),
      ...(categorie && { categorie }),
      ...(auteur && { auteur }),
      ...(statut && { statut }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
  })

  res.json(updated)
}

// DELETE /api/articles/:id — supprimer un article (admin)
export async function deleteArticle(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params

  const article = await prisma.article.findUnique({ where: { id } })
  if (!article) {
    res.status(404).json({ error: 'Article introuvable' })
    return
  }

  await prisma.article.delete({ where: { id } })
  res.json({ message: 'Article supprimé' })
}

// POST /api/articles/upload-image — upload image de couverture
export async function uploadImageArticle(req: AuthRequest, res: Response): Promise<void> {
  const file = req.file
  if (!file) {
    res.status(400).json({ error: 'Fichier requis' })
    return
  }

  const url = await uploadFile(
    file.buffer,
    file.originalname,
    file.mimetype,
    'articles/images'
  )

  res.json({ url })
}