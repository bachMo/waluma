/**
 * Formes de réponse réelles de l'API Waluma (apps/api).
 *
 * Toutes les routes de liste renvoient un objet enveloppe { <clé>, total, page },
 * jamais un tableau nu — d'où les plantages quand on fait .filter() sur data.
 */

/* ── Énumérations (prisma/schema.prisma) ─────────────────── */

export type Specialite =
  | 'INFIRMIER' | 'MEDECIN_GENERALISTE' | 'SAGE_FEMME'
  | 'KINESITHERAPEUTE' | 'PRELEVEUR' | 'PEDIATRE' | 'AUTRE'

export type StatutPraticien = 'EN_ATTENTE' | 'VALIDE' | 'SUSPENDU' | 'REFUSE'

export type StatutMission =
  | 'EN_ATTENTE' | 'ACCEPTEE' | 'EN_ROUTE' | 'ARRIVE'
  | 'EN_COURS' | 'TERMINEE' | 'ANNULEE' | 'EXPIREE'

export type StatutLitige = 'OUVERT' | 'EN_TRAITEMENT' | 'RESOLU' | 'CLOS'

/** Statuts acceptés par PATCH /demandes/:id */
export type StatutDemande = 'EN_ATTENTE' | 'EN_COURS' | 'TRAITEE' | 'REFUSEE'

export const SPECIALITE_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers',
  MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme',
  KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement',
  PEDIATRE: 'Pédiatre',
  AUTRE: 'Autre',
}

export const STATUT_PRATICIEN_LABEL: Record<string, string> = {
  EN_ATTENTE: 'À valider',
  VALIDE: 'Actif',
  SUSPENDU: 'Suspendu',
  REFUSE: 'Refusé',
}

export const STATUT_MISSION_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  ACCEPTEE: 'Acceptée',
  EN_ROUTE: 'En route',
  ARRIVE: 'Arrivé',
  EN_COURS: 'Soin en cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
  EXPIREE: 'Expirée',
}

export const STATUT_LITIGE_LABEL: Record<string, string> = {
  OUVERT: 'Ouvert',
  EN_TRAITEMENT: 'En traitement',
  RESOLU: 'Résolu',
  CLOS: 'Clos',
}

export const STATUT_DEMANDE_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS: 'En cours',
  TRAITEE: 'Traitée',
  REFUSEE: 'Refusée',
}

/* ── Entités ─────────────────────────────────────────────── */

export interface UserBref {
  nom: string
  prenom: string
  telephone?: string
  role?: string
}

export interface PraticienSpecialite {
  specialite: Specialite
  principale: boolean
}

export interface DocumentPraticien {
  id: string
  type: string
  statut: string
  url: string
  nom: string
  commentaireAdmin: string | null
  createdAt: string
}

export interface Praticien {
  id: string
  userId: string
  user: UserBref
  numeroOrdre: string | null
  anneesExperience: number
  bio: string | null
  zoneIntervention: string[]
  disponible: boolean
  statutCompte: StatutPraticien
  bloque: boolean
  commission: number
  operateurMM: string | null
  numeroMM: string | null
  totalMissions: number
  noteMoyenne: number | null
  tauxAcceptation: number | null
  createdAt: string
  specialites?: PraticienSpecialite[] | null
  documents?: DocumentPraticien[] | null
}

export interface Mission {
  id: string
  reference: string
  patientId: string
  patient: UserBref
  praticienId: string | null
  praticien: { id: string; user: UserBref } | null
  type: string
  specialite: Specialite
  statut: StatutMission
  adresseTexte: string
  urgence: boolean
  montantBase: number
  fraisDeplacement: number
  montantTotal: number
  dateHeureSoin: string | null
  finSoinAt: string | null
  createdAt: string
  paiements?: { statut: string; type: string }[] | null
}

export interface Litige {
  id: string
  missionId: string
  mission: Mission
  statut: StatutLitige
  motif: string
  description: string | null
  resolution: string | null
  ouvertAt: string
  resoluAt: string | null
  createdAt: string
}

export interface Article {
  id: string
  titre: string
  contenu: string
  categorie: string
  auteur: string
  statut: string
  imageUrl: string | null
  vues: number
  createdAt: string
  updatedAt: string
}

/** Demande générique d'un utilisateur (type SPECIALITE | ZONE | AUTRE),
 *  pas une candidature de praticien. */
export interface Demande {
  id: string
  userId: string
  user: UserBref
  type: string
  description: string
  details: string
  statut: string
  reponseAdmin: string | null
  traiteeAt: string | null
  createdAt: string
}

/* ── Enveloppes de liste ─────────────────────────────────── */

export interface ListePraticiens { praticiens: Praticien[]; total: number; page: number }
export interface ListeMissions   { missions: Mission[];     total: number; page: number }
export interface ListeLitiges    { litiges: Litige[];       total: number; page: number }
export interface ListeArticles   { articles: Article[];     total: number; page: number }
export interface ListeDemandes   { demandes: Demande[];     total: number }

/* ── Statistiques ────────────────────────────────────────── */

/** GET /stats/dashboard */
export interface DashboardStats {
  kpis: {
    totalMissions: number
    missionsActives: number
    missionsCeMois: number
    totalPraticiens: number
    praticiensActifs: number
    praticiensAValider: number
    totalLitiges: number
    litigesOuverts: number
    totalPatients: number
    volumeCeMois: number
  }
  topPraticiens: {
    nom: string
    missions: number
    note: number | null
    specialite?: Specialite
  }[]
  repartitionSpecialites: { specialite: Specialite; count: number }[]
  graphiqueMissions: { jour: string; missions: number }[]
}

/** GET /stats/badges */
export interface Badges {
  praticiensEnAttente: number
  missionsActives: number
  litigesOuverts: number
  demandesEnAttente: number
}

/* ── Paramètres : GET /parametres → { grouped, raw } ─────── */

export interface ParametreBrut {
  id: string
  cle: string
  valeur: string
  type: string
  categorie: string
  label: string
  description: string | null
}

export interface ReponseParametres {
  grouped: Record<string, Record<string, {
    valeur: string | number | boolean
    label: string
    description: string | null
    type: string
  }>>
  raw: ParametreBrut[]
}

/* ── Utilitaires ─────────────────────────────────────────── */

export const fcfa = (n: number | null | undefined): string =>
  `${Math.round(n ?? 0).toLocaleString('fr-FR').replace(/ | /g, ' ')} F`

export const nombre = (n: number | null | undefined): string =>
  (n ?? 0).toLocaleString('fr-FR').replace(/ | /g, ' ')

export const dateCourte = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const heure = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export const nomComplet = (u: UserBref | null | undefined): string =>
  u ? `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || '—' : '—'

/** Spécialité principale d'un praticien, avec repli sur la première. */
export const specialitePrincipale = (p: Praticien): string => {
  const liste = p.specialites ?? []
  const princ = liste.find((s) => s.principale) ?? liste[0]
  return princ ? (SPECIALITE_LABEL[princ.specialite] ?? princ.specialite) : '—'
}
