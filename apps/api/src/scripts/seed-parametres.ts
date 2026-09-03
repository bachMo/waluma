import { prisma } from '../prisma/client'

const parametresDefaut = [
  // Tarifs
  { cle: 'commission_standard', valeur: '10', type: 'number', categorie: 'tarifs', label: 'Commission Waluma standard', description: 'Prélevée à la clôture de chaque mission (%)' },
  { cle: 'tarif_infirmier', valeur: '8000', type: 'number', categorie: 'tarifs', label: 'Soins infirmiers — base', description: 'Tarif minimum facturé au patient (FCFA)' },
  { cle: 'tarif_medecin', valeur: '15000', type: 'number', categorie: 'tarifs', label: 'Médecine générale — base', description: 'Tarif minimum facturé au patient (FCFA)' },
  { cle: 'tarif_sage_femme', valeur: '12000', type: 'number', categorie: 'tarifs', label: 'Sage-femme — base', description: 'Tarif minimum facturé au patient (FCFA)' },
  { cle: 'frais_deplacement', valeur: '2500', type: 'number', categorie: 'tarifs', label: 'Frais de déplacement', description: 'Ajoutés automatiquement à chaque mission (FCFA)' },
  // Matching
  { cle: 'rayon_recherche_km', valeur: '10', type: 'number', categorie: 'matching', label: 'Rayon de recherche maximum', description: 'Distance max pour trouver un praticien (km)' },
  { cle: 'delai_repli_generaliste', valeur: '3', type: 'number', categorie: 'matching', label: 'Délai avant repli généraliste', description: 'Si aucun spécialiste disponible (min)' },
  { cle: 'delai_expiration_demande', valeur: '2', type: 'number', categorie: 'matching', label: "Délai d'expiration d'une demande", description: 'Avant annulation automatique (min)' },
  { cle: 'taux_annulation_max', valeur: '15', type: 'number', categorie: 'matching', label: "Taux d'annulation max praticien", description: "Au-delà → alerte automatique (%)" },
  { cle: 'priorite_distance_urgence', valeur: 'true', type: 'boolean', categorie: 'matching', label: 'Priorité distance en urgence', description: 'La distance prime sur la spécialité' },
  // Notifications
  { cle: 'otp_connexion', valeur: 'true', type: 'boolean', categorie: 'notifications', label: 'Vérification OTP à la connexion', description: 'Code envoyé pour chaque connexion' },
  { cle: 'notif_push_statut', valeur: 'true', type: 'boolean', categorie: 'notifications', label: 'Notifications push', description: 'Changements de statut des missions' },
  { cle: 'seuil_solde_bas', valeur: '5000', type: 'number', categorie: 'notifications', label: 'Alerte solde bas praticien', description: 'Seuil déclencheur (FCFA)' },
  // Sécurité
  { cle: 'duree_session_admin', valeur: '30', type: 'number', categorie: 'securite', label: 'Durée de session admin', description: 'Déconnexion automatique après inactivité (min)' },
  { cle: 'logs_activite_admin', valeur: 'true', type: 'boolean', categorie: 'securite', label: "Logs d'activité admin", description: 'Enregistrement de toutes les actions' },
  { cle: 'mode_maintenance', valeur: 'false', type: 'boolean', categorie: 'securite', label: 'Mode maintenance', description: 'Bloque toutes les nouvelles missions' },
]

async function main() {
  for (const p of parametresDefaut) {
    await prisma.parametre.upsert({
      where: { cle: p.cle },
      update: {},
      create: p,
    })
  }
  console.log(`✅ ${parametresDefaut.length} paramètres initialisés`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())