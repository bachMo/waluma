import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, TextInput, TouchableWithoutFeedback, Keyboard
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { connectSocket, joinMission, leaveMission } from '@/lib/socket'
import api from '@/lib/api'

interface CompteRendu {
  acteRealise: string
  description: string
  recommandations: string | null
  suiteNecessaire: string | null
  tension: string | null
  temperature: number | null
  pouls: number | null
  spo2: number | null
}

interface Avis {
  id: string
  note: number
  commentaire: string | null
  createdAt: string
}

interface Litige {
  id: string
  statut: string
  motif: string
  description: string | null
  createdAt: string
}

interface Mission {
  id: string
  statut: string
  specialite: string
  adresseTexte: string
  montantTotal: number
  finSoinAt: string | null
  paiements: { statut: string; type: string }[]
  praticien: { id: string; user: { nom: string; prenom: string; telephone: string } } | null
  compteRendu: CompteRendu | null
  avis: Avis[]
  litige: Litige | null
}

const STEPS = [
  { statut: 'ACCEPTEE', label: 'Praticien trouvé', icon: 'checkmark-circle' },
  { statut: 'EN_ROUTE', label: 'En route vers vous', icon: 'car' },
  { statut: 'ARRIVE', label: 'Arrivé chez vous', icon: 'location' },
  { statut: 'EN_COURS', label: 'Soin en cours', icon: 'medical' },
  { statut: 'TERMINEE', label: 'Soin terminé', icon: 'checkmark-done-circle' },
]

const STATUT_ORDER = ['EN_ATTENTE', 'ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS', 'TERMINEE']

const SPECIALITE_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

const LITIGE_STATUT_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  OUVERT: { label: 'En cours d\'examen', color: '#d97706', bg: '#fef3c7' },
  EN_TRAITEMENT: { label: 'En traitement', color: '#0891b2', bg: '#cffafe' },
  RESOLU: { label: 'Résolu', color: '#15803d', bg: '#dcfce7' },
  CLOS: { label: 'Clôturé', color: '#6b7280', bg: '#f3f4f6' },
}

export default function SuiviScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>()
  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)

  // Avis
  const [showAvisForm, setShowAvisForm] = useState(false)
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [avisLoading, setAvisLoading] = useState(false)

  // Litige
  const [showLitigeForm, setShowLitigeForm] = useState(false)
  const [litigeMotif, setLitigeMotif] = useState('')
  const [litigeDesc, setLitigeDesc] = useState('')
  const [litigeLoading, setLitigeLoading] = useState(false)

  async function load() {
    try {
      const { data } = await api.get(`/missions/${missionId}`)
      setMission(data)
    } catch {
      Alert.alert('Erreur', 'Mission introuvable')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    async function initSocket() {
      try {
        const sock = await connectSocket()
        joinMission(missionId)
        sock.on('mission:statut', (data: { missionId: string; statut: string }) => {
          if (data.missionId === missionId) load()
        })
      } catch (e) { console.error('Socket error:', e) }
    }
    initSocket()
    return () => { clearInterval(interval); leaveMission(missionId) }
  }, [missionId])

  async function handleAnnuler() {
    Alert.alert('Annuler la mission', 'Voulez-vous vraiment annuler cette demande de soin ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler', style: 'destructive',
        onPress: async () => {
          try {
            await api.patch(`/missions/${missionId}/statut`, { statut: 'ANNULEE' })
            router.replace('/(tabs)' as never)
          } catch (e: unknown) {
            const err = e as { response?: { data?: { error?: string }; status?: number } }
            Alert.alert('Erreur', `${err?.response?.status} - ${err?.response?.data?.error || 'Erreur inconnue'}`)
          }
        },
      },
    ])
  }

  async function handleAvis() {
    if (note === 0) { Alert.alert('Note requise', 'Sélectionnez une note entre 1 et 5'); return }
    setAvisLoading(true)
    try {
      await api.post(`/missions/${missionId}/avis`, { note, commentaire: commentaire.trim() || undefined })
      setShowAvisForm(false)
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'envoyer l\'avis')
    } finally { setAvisLoading(false) }
  }

  async function handleLitige() {
    if (!litigeMotif.trim()) { Alert.alert('Motif requis', 'Décrivez le motif du litige'); return }
    setLitigeLoading(true)
    try {
      await api.post('/litiges', { missionId, motif: litigeMotif.trim(), description: litigeDesc.trim() || undefined })
      setShowLitigeForm(false)
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de déclarer le litige')
    } finally { setLitigeLoading(false) }
  }

  const currentIndex = mission ? STATUT_ORDER.indexOf(mission.statut) : 0
  const paiementPatient = mission?.paiements?.find(p => p.type === 'PATIENT')
  const dejaPayee = paiementPatient?.statut === 'PAYE' ||
    mission?.paiements?.some(p => p.type === 'COMMISSION_PRATICIEN' && p.statut === 'PAYE')
  const avisExistant = mission?.avis?.[0] ?? null
  const litigeExistant = mission?.litige ?? null

  if (loading) return <View style={s.center}><ActivityIndicator color="#0d5068" size="large" /></View>
  if (!mission) return null

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)' as never)} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Suivi de ma demande</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Statut principal */}
          <View style={s.statusCard}>
            {mission.statut === 'EN_ATTENTE' ? (
              <>
                <ActivityIndicator color="#0d5068" style={{ marginBottom: 12 }} />
                <Text style={s.statusTitle}>Recherche d'un praticien...</Text>
                <Text style={s.statusSub}>Nous cherchons le meilleur praticien disponible près de vous</Text>
                <TouchableOpacity style={s.cancelBtn} onPress={handleAnnuler}>
                  <Text style={s.cancelBtnText}>Annuler la demande</Text>
                </TouchableOpacity>
              </>
            ) : mission.statut === 'TERMINEE' ? (
              <>
                <View style={s.termineeIcon}>
                  <Ionicons name="checkmark-circle" size={44} color="#22c55e" />
                </View>
                <Text style={s.statusTitle}>Soin terminé</Text>
                <Text style={s.statusSub}>Merci de votre confiance</Text>
                <View style={s.postSoinBtns}>
                  {/* Paiement */}
                  {!dejaPayee ? (
                    <TouchableOpacity style={s.payBtn}
                      onPress={() => router.push({ pathname: '/(tabs)/paiement', params: { missionId: mission.id } })}
                      activeOpacity={0.88}
                    >
                      <Ionicons name="card" size={18} color="#fff" />
                      <Text style={s.payBtnText}>Payer maintenant</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={s.payeeBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                      <Text style={s.payeeBadgeText}>Paiement effectué</Text>
                    </View>
                  )}

                  {/* Avis — bouton si pas encore donné */}
                  {!avisExistant && !showAvisForm && (
                    <TouchableOpacity style={s.avisBtn} onPress={() => setShowAvisForm(true)} activeOpacity={0.88}>
                      <Ionicons name="star-outline" size={18} color="#0d5068" />
                      <Text style={s.avisBtnText}>Laisser un avis</Text>
                    </TouchableOpacity>
                  )}

                  {/* Litige — bouton si pas encore déclaré */}
                  {!litigeExistant && !showLitigeForm && (
                    <TouchableOpacity style={s.litigeBtn}
                      onPress={() => setShowLitigeForm(true)} activeOpacity={0.88}
                    >
                      <Ionicons name="flag-outline" size={18} color="#dc2626" />
                      <Text style={s.litigeBtnText}>Signaler un problème</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : mission.statut === 'ANNULEE' ? (
              <>
                <View style={[s.termineeIcon, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="close-circle" size={44} color="#dc2626" />
                </View>
                <Text style={s.statusTitle}>Mission annulée</Text>
                <Text style={s.statusSub}>Cette mission a été annulée</Text>
                <TouchableOpacity style={[s.payBtn, { marginTop: 16, backgroundColor: '#0d5068' }]}
                  onPress={() => router.replace('/(tabs)' as never)}>
                  <Text style={s.payBtnText}>Retour à l'accueil</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={s.activeIcon}>
                  <Ionicons name={STEPS.find(s => s.statut === mission.statut)?.icon as never ?? 'time'} size={32} color="#0d5068" />
                </View>
                <Text style={s.statusTitle}>
                  {STEPS.find(s => s.statut === mission.statut)?.label || mission.statut}
                </Text>
                <Text style={s.statusSub}>Mis à jour toutes les 15 secondes</Text>
                {['ACCEPTEE', 'EN_ROUTE'].includes(mission.statut) && (
                  <TouchableOpacity style={s.cancelBtn} onPress={handleAnnuler}>
                    <Text style={s.cancelBtnText}>Annuler la mission</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* Formulaire avis inline */}
          {showAvisForm && (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={s.formCard}>
                <Text style={s.formTitle}>Votre avis sur le praticien</Text>
                <View style={s.starsRow}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <TouchableOpacity key={i} onPress={() => setNote(i)} activeOpacity={0.7}>
                      <Ionicons name={i <= note ? 'star' : 'star-outline'} size={36} color={i <= note ? '#f59e0b' : '#d1d0c9'} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={s.formInput}
                  value={commentaire}
                  onChangeText={setCommentaire}
                  placeholder="Commentaire (optionnel)"
                  placeholderTextColor="#b4b2a9"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={Keyboard.dismiss}
                />
                <View style={s.formBtns}>
                  <TouchableOpacity style={s.formCancelBtn} onPress={() => setShowAvisForm(false)}>
                    <Text style={s.formCancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.formConfirmBtn, avisLoading && { opacity: 0.6 }]}
                    onPress={handleAvis} disabled={avisLoading}
                  >
                    {avisLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.formConfirmText}>Envoyer</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          {/* Avis déjà donné */}
          {avisExistant && (
            <View style={s.avisCard}>
              <View style={s.avisHeader}>
                <Text style={s.avisTitle}>Votre avis</Text>
                <View style={s.avisStars}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <Ionicons key={i} name={i <= avisExistant.note ? 'star' : 'star-outline'} size={16} color={i <= avisExistant.note ? '#f59e0b' : '#d1d0c9'} />
                  ))}
                </View>
              </View>
              {avisExistant.commentaire && <Text style={s.avisCommentaire}>{avisExistant.commentaire}</Text>}
            </View>
          )}

          {/* Formulaire litige inline */}
          {showLitigeForm && (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={s.formCard}>
                <Text style={s.formTitle}>Signaler un problème</Text>
                <Text style={s.formLabel}>Motif <Text style={{ color: '#dc2626' }}>*</Text></Text>
                <TextInput
                  style={s.formInput}
                  value={litigeMotif}
                  onChangeText={setLitigeMotif}
                  placeholder="Ex : Praticien ne s'est pas présenté, soin incomplet..."
                  placeholderTextColor="#b4b2a9"
                  returnKeyType="next"
                />
                <Text style={s.formLabel}>Description (optionnel)</Text>
                <TextInput
                  style={[s.formInput, { minHeight: 80 }]}
                  value={litigeDesc}
                  onChangeText={setLitigeDesc}
                  placeholder="Décrivez le problème en détail..."
                  placeholderTextColor="#b4b2a9"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  blurOnSubmit
                  onSubmitEditing={Keyboard.dismiss}
                />
                <View style={s.formBtns}>
                  <TouchableOpacity style={s.formCancelBtn} onPress={() => setShowLitigeForm(false)}>
                    <Text style={s.formCancelText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.formConfirmBtn, { backgroundColor: '#dc2626' }, litigeLoading && { opacity: 0.6 }]}
                    onPress={handleLitige} disabled={litigeLoading}
                  >
                    {litigeLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.formConfirmText}>Envoyer</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}

          {/* Litige existant */}
          {litigeExistant && (() => {
            const cfg = LITIGE_STATUT_LABEL[litigeExistant.statut] ?? LITIGE_STATUT_LABEL.OUVERT
            return (
              <View style={s.litigeCard}>
                <View style={s.litigeHeader}>
                  <Ionicons name="flag" size={16} color="#dc2626" />
                  <Text style={s.litigeTitle}>Litige déclaré</Text>
                  <View style={[s.litigeStatutBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.litigeStatutText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <Text style={s.litigeMotif}>{litigeExistant.motif}</Text>
                {litigeExistant.description && <Text style={s.litigeDesc}>{litigeExistant.description}</Text>}
              </View>
            )
          })()}

          {/* Praticien */}
          {mission.praticien && (
            <View style={s.praticienCard}>
              <View style={s.praticienAvatar}>
                <Text style={s.praticienAvatarText}>
                  {mission.praticien.user.prenom[0]}{mission.praticien.user.nom[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.praticienName}>{mission.praticien.user.prenom} {mission.praticien.user.nom}</Text>
                <Text style={s.praticienSpec}>{SPECIALITE_LABEL[mission.specialite]}</Text>
              </View>
              <TouchableOpacity style={s.callBtn} onPress={() => Alert.alert('Appeler', `${mission.praticien?.user.telephone} ?`)}>
                <Ionicons name="call" size={20} color="#0d5068" />
              </TouchableOpacity>
            </View>
          )}

          {/* Compte rendu (mission terminée) ou Timeline (mission active) */}
          {mission.statut === 'TERMINEE' && mission.compteRendu ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Compte rendu de soin</Text>
              <View style={s.crCard}>
                <View style={s.crRow}>
                  <Text style={s.crLabel}>Acte réalisé</Text>
                  <Text style={s.crValue}>{mission.compteRendu.acteRealise}</Text>
                </View>
                <View style={s.crRow}>
                  <Text style={s.crLabel}>Description</Text>
                  <Text style={s.crValue}>{mission.compteRendu.description}</Text>
                </View>
                {mission.compteRendu.recommandations && (
                  <View style={s.crRow}>
                    <Text style={s.crLabel}>Recommandations</Text>
                    <Text style={s.crValue}>{mission.compteRendu.recommandations}</Text>
                  </View>
                )}
                {mission.compteRendu.suiteNecessaire && (
                  <View style={[s.crRow, { borderBottomWidth: 0 }]}>
                    <Text style={s.crLabel}>Suite nécessaire</Text>
                    <Text style={s.crValue}>{mission.compteRendu.suiteNecessaire}</Text>
                  </View>
                )}
                {(mission.compteRendu.tension || mission.compteRendu.temperature || mission.compteRendu.pouls || mission.compteRendu.spo2) && (
                  <View style={s.constantesRow}>
                    {[
                      { label: 'Tension', value: mission.compteRendu.tension, unit: 'mmHg' },
                      { label: 'Temp.', value: mission.compteRendu.temperature, unit: '°C' },
                      { label: 'Pouls', value: mission.compteRendu.pouls, unit: 'bpm' },
                      { label: 'SpO₂', value: mission.compteRendu.spo2, unit: '%' },
                    ].filter(c => c.value).map(c => (
                      <View key={c.label} style={s.constante}>
                        <Text style={s.constanteLabel}>{c.label}</Text>
                        <Text style={s.constanteVal}>{c.value}<Text style={s.constanteUnit}> {c.unit}</Text></Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ) : mission.statut !== 'TERMINEE' && mission.statut !== 'ANNULEE' ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Progression</Text>
              <View style={s.timeline}>
                {STEPS.map((step, i) => {
                  const stepIndex = STATUT_ORDER.indexOf(step.statut)
                  const isDone = currentIndex >= stepIndex
                  const isActive = currentIndex === stepIndex
                  return (
                    <View key={step.statut} style={s.timelineRow}>
                      <View style={s.timelineLeft}>
                        <View style={[s.timelineDot, isDone && s.timelineDotDone, isActive && s.timelineDotActive]}>
                          {isDone ? <Ionicons name={step.icon as never} size={14} color="#fff" /> : null}
                        </View>
                        {i < STEPS.length - 1 && <View style={[s.timelineLine, isDone && s.timelineLineDone]} />}
                      </View>
                      <View style={s.timelineContent}>
                        <Text style={[s.timelineLabel, isDone && s.timelineLabelDone, isActive && s.timelineLabelActive]}>
                          {step.label}
                        </Text>
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>
          ) : null}

          {/* Détails */}
          <View style={s.detailCard}>
            <Text style={s.detailTitle}>Détails de la demande</Text>
            {[
              { label: 'Type de soin', value: SPECIALITE_LABEL[mission.specialite] },
              { label: 'Adresse', value: mission.adresseTexte },
              { label: 'Montant total', value: `${mission.montantTotal.toLocaleString()} FCFA`, green: true },
            ].map((item, i) => (
              <View key={i} style={[s.detailRow, i < 2 && s.detailRowBorder]}>
                <Text style={s.detailLabel}>{item.label}</Text>
                <Text style={[s.detailVal, item.green && s.detailValGreen]} numberOfLines={2}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerGrad: { paddingTop: 52 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  body: { flex: 1 },
  statusCard: { backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  termineeIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  activeIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  statusTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a18', marginBottom: 6, textAlign: 'center' },
  statusSub: { fontSize: 13, color: '#888780', textAlign: 'center', marginBottom: 4 },
  cancelBtn: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2' },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: '#dc2626' },
  postSoinBtns: { width: '100%', gap: 10, marginTop: 20 },
  payBtn: { backgroundColor: '#22c55e', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  payBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  payeeBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#dcfce7', borderRadius: 12, padding: 12 },
  payeeBadgeText: { fontSize: 14, fontWeight: '700', color: '#15803d' },
  avisBtn: { backgroundColor: '#e0f2fe', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  avisBtnText: { fontSize: 14, fontWeight: '700', color: '#0d5068' },
  litigeBtn: { backgroundColor: '#fff5f5', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#fee2e2' },
  litigeBtnText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
  // Formulaires inline
  formCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a18', marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#5f5e5a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, justifyContent: 'center' },
  formInput: { backgroundColor: '#f5f4ef', borderRadius: 12, padding: 14, fontSize: 14, color: '#1a1a18', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', marginBottom: 14, minHeight: 48 },
  formBtns: { flexDirection: 'row', gap: 10 },
  formCancelBtn: { flex: 1, borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: '#e5e4df' },
  formCancelText: { fontSize: 14, fontWeight: '600', color: '#888780' },
  formConfirmBtn: { flex: 1, borderRadius: 12, padding: 13, alignItems: 'center', backgroundColor: '#22c55e' },
  formConfirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  // Avis existant
  avisCard: { backgroundColor: '#fffbeb', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: '#fcd34d' },
  avisHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  avisTitle: { fontSize: 13, fontWeight: '700', color: '#92400e', flex: 1 },
  avisStars: { flexDirection: 'row', gap: 2 },
  avisCommentaire: { fontSize: 13, color: '#78350f', lineHeight: 18 },
  // Litige existant
  litigeCard: { backgroundColor: '#fff5f5', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: '#fca5a5' },
  litigeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  litigeTitle: { fontSize: 13, fontWeight: '700', color: '#dc2626', flex: 1 },
  litigeStatutBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  litigeStatutText: { fontSize: 11, fontWeight: '700' },
  litigeMotif: { fontSize: 13, fontWeight: '600', color: '#1a1a18', marginBottom: 4 },
  litigeDesc: { fontSize: 12, color: '#5f5e5a', lineHeight: 17 },
  // Praticien
  praticienCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  praticienAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  praticienAvatarText: { fontSize: 16, fontWeight: '700', color: '#0d5068' },
  praticienName: { fontSize: 15, fontWeight: '700', color: '#1a1a18', marginBottom: 2 },
  praticienSpec: { fontSize: 12, color: '#888780' },
  callBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  // Compte rendu
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 12 },
  crCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  crRow: { paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  crLabel: { fontSize: 11, fontWeight: '700', color: '#888780', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  crValue: { fontSize: 14, color: '#1a1a18', lineHeight: 20 },
  constantesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  constante: { flex: 1, minWidth: '45%', backgroundColor: '#f5f4ef', borderRadius: 12, padding: 10 },
  constanteLabel: { fontSize: 10, fontWeight: '600', color: '#888780', marginBottom: 4 },
  constanteVal: { fontSize: 16, fontWeight: '800', color: '#1a1a18' },
  constanteUnit: { fontSize: 11, fontWeight: '400', color: '#888780' },
  // Timeline
  timeline: { backgroundColor: '#fff', borderRadius: 18, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 28 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f0eb', borderWidth: 1.5, borderColor: '#e5e4df', alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  timelineDotActive: { backgroundColor: '#0d5068', borderColor: '#0d5068' },
  timelineLine: { width: 1.5, flex: 1, backgroundColor: '#e5e4df', minHeight: 24, marginVertical: 4 },
  timelineLineDone: { backgroundColor: '#22c55e' },
  timelineContent: { flex: 1, paddingBottom: 28 },
  timelineLabel: { fontSize: 14, color: '#b4b2a9', fontWeight: '500' },
  timelineLabelDone: { color: '#22c55e', fontWeight: '600' },
  timelineLabelActive: { color: '#0d5068', fontWeight: '700' },
  // Détails
  detailCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  detailTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: 12 },
  detailRowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  detailLabel: { fontSize: 13, color: '#888780' },
  detailVal: { fontSize: 13, color: '#1a1a18', fontWeight: '600', textAlign: 'right', flex: 1 },
  detailValGreen: { color: '#22c55e', fontSize: 14, fontWeight: '800' },
})