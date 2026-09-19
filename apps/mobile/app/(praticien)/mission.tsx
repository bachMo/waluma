import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
  StatusBar, Linking, Modal, Platform,
  KeyboardAvoidingView, TextInput, TouchableWithoutFeedback, Keyboard
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Location from 'expo-location'
import api from '@/lib/api'
import { connectSocket, emitPosition } from '@/lib/socket'

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
}

interface Litige {
  id: string
  statut: string
  motif: string
  description: string | null
}

interface Mission {
  id: string
  statut: string
  specialite: string
  adresseTexte: string
  latitude: number | null
  longitude: number | null
  montantTotal: number
  montantBase: number
  fraisDeplacement: number
  urgence: boolean
  notePatient: string | null
  createdAt: string
  patientId: string
  patient: { nom: string; prenom: string; telephone: string }
  compteRendu: CompteRendu | null
  paiements: { statut: string; montant: number; type: string }[]
  avis: Avis[]
  litige: Litige | null
}

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

const STATUT_STEPS: { statut: string; label: string; action: string; color: string; next: string }[] = [
  { statut: 'ACCEPTEE', label: 'Démarrer le trajet', action: 'EN_ROUTE', color: '#7c3aed', next: 'Praticien trouvé' },
  { statut: 'EN_ROUTE', label: 'Je suis arrivé', action: 'ARRIVE', color: '#0891b2', next: 'En route vers vous' },
  { statut: 'ARRIVE', label: 'Commencer le soin', action: 'EN_COURS', color: '#0d5068', next: 'Arrivé chez vous' },
  { statut: 'EN_COURS', label: 'Terminer et rédiger le CR', action: 'TERMINEE', color: '#22c55e', next: 'Soin en cours' },
]

const STATUTS_TERMINES = ['TERMINEE', 'ANNULEE', 'EXPIREE']

const OPERATEURS = [
  { key: 'WAVE', label: 'Wave', color: '#0066FF' },
  { key: 'ORANGE_MONEY', label: 'Orange Money', color: '#FF6600' },
  { key: 'FREE_MONEY', label: 'Free Money', color: '#CC0000' },
]

const LITIGE_STATUT_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  OUVERT: { label: 'En cours d\'examen', color: '#d97706', bg: '#fef3c7' },
  EN_TRAITEMENT: { label: 'En traitement', color: '#0891b2', bg: '#cffafe' },
  RESOLU: { label: 'Résolu', color: '#15803d', bg: '#dcfce7' },
  CLOS: { label: 'Clôturé', color: '#6b7280', bg: '#f3f4f6' },
}

export default function MissionScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>()
  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const locationSubRef = useRef<Location.LocationSubscription | null>(null)

  // Commission
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [operateur, setOperateur] = useState('WAVE')
  const [paiementLoading, setPaiementLoading] = useState(false)

  // Avis sur patient
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
    async function initSocketAndLocation() {
      try {
        await connectSocket()
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted' && missionId) {
          const sub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 10 },
            (loc) => { emitPosition(missionId, loc.coords.latitude, loc.coords.longitude) }
          )
          locationSubRef.current = sub
        }
      } catch (e) { console.error('Socket/location error:', e) }
    }
    initSocketAndLocation()
    return () => { clearInterval(interval); locationSubRef.current?.remove() }
  }, [missionId])

  async function handleAction(newStatut: string) {
    if (newStatut === 'TERMINEE') {
      router.push({ pathname: '/(praticien)/compte-rendu', params: { missionId } })
      return
    }
    setActionLoading(true)
    try {
      await api.patch(`/missions/${missionId}/statut`, { statut: newStatut })
      await load()
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut')
    } finally { setActionLoading(false) }
  }

  async function handleAnnuler() {
    Alert.alert('Annuler la mission', 'Voulez-vous vraiment annuler cette mission ? Le patient sera notifié.', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler', style: 'destructive',
        onPress: async () => {
          setActionLoading(true)
          try {
            await api.patch(`/missions/${missionId}/statut`, { statut: 'ANNULEE' })
            router.replace('/(praticien)' as never)
          } catch { Alert.alert('Erreur', 'Impossible d\'annuler la mission') }
          finally { setActionLoading(false) }
        },
      },
    ])
  }

  async function handlePaiementCommission() {
    setPaiementLoading(true)
    try {
      const { data } = await api.post('/paiements/commission', { missionId, operateur, numeroMM: '' })
      await api.post(`/paiements/${data.paiementCommission.id}/confirmer`)
      setShowCommissionModal(false)
      Alert.alert('✓ Commission payée', `Commission de ${data.montantCommission.toLocaleString()} FCFA enregistrée.`,
        [{ text: 'OK', onPress: () => load() }])
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de traiter le paiement')
    } finally { setPaiementLoading(false) }
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

  function openMaps() {
    if (!mission) return
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(mission.adresseTexte + ', Dakar, Sénégal')}`)
  }

  function callPatient() {
    if (!mission) return
    Linking.openURL(`tel:${mission.patient.telephone}`)
  }

  const currentStep = STATUT_STEPS.find(s => s.statut === mission?.statut)
  const stepIndex = STATUT_STEPS.findIndex(s => s.statut === mission?.statut)
  const estTerminee = mission ? STATUTS_TERMINES.includes(mission.statut) : false
  const paiementRecu = mission?.paiements?.some(p => p.statut === 'PAYE')
  const montantCommission = mission ? Math.round(mission.montantTotal * 0.1) : 0
  const avisExistant = mission?.avis?.[0] ?? null
  const litigeExistant = mission?.litige ?? null

  if (loading) return <View style={s.center}><ActivityIndicator color="#0d5068" size="large" /></View>
  if (!mission) return null

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <SafeAreaView>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>{estTerminee ? 'Détail de la mission' : 'Mission en cours'}</Text>
            {mission.urgence && <View style={s.urgentBadge}><Text style={s.urgentText}>URGENT</Text></View>}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {estTerminee && (
            <View style={[s.statutCard, mission.statut === 'ANNULEE' && s.statutCardAnnulee]}>
              <Ionicons name={mission.statut === 'TERMINEE' ? 'checkmark-circle' : 'close-circle'} size={28}
                color={mission.statut === 'TERMINEE' ? '#22c55e' : '#dc2626'} />
              <Text style={[s.statutText, mission.statut === 'ANNULEE' && { color: '#dc2626' }]}>
                {mission.statut === 'TERMINEE' ? 'Mission terminée' : 'Mission annulée'}
              </Text>
            </View>
          )}

          <View style={s.patientCard}>
            <LinearGradient colors={['#e0f2fe', '#f0fdf4']} style={s.patientAvatar}>
              <Text style={s.patientAvatarText}>{mission.patient.prenom[0]}{mission.patient.nom[0]}</Text>
            </LinearGradient>
            <View style={s.patientInfo}>
              <Text style={s.patientName}>{mission.patient.prenom} {mission.patient.nom}</Text>
              <Text style={s.patientSpec}>{SPEC_LABEL[mission.specialite]}</Text>
              <Text style={s.patientAddr} numberOfLines={2}>{mission.adresseTexte}</Text>
            </View>
            <View style={s.patientActions}>
              <TouchableOpacity style={s.actionBtn} onPress={callPatient}>
                <Ionicons name="call" size={20} color="#0d5068" />
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, s.actionBtnGreen]} onPress={openMaps}>
                <Ionicons name="navigate" size={20} color="#22c55e" />
              </TouchableOpacity>
            </View>
          </View>

          {mission.notePatient && (
            <View style={s.noteCard}>
              <View style={s.noteHeader}>
                <Ionicons name="information-circle-outline" size={18} color="#0d5068" />
                <Text style={s.noteTitle}>Note du patient</Text>
              </View>
              <Text style={s.noteText}>{mission.notePatient}</Text>
            </View>
          )}

          {/* Progression — missions actives */}
          {!estTerminee && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Progression de la mission</Text>
              <View style={s.timeline}>
                {STATUT_STEPS.map((step, i) => {
                  const isDone = i < stepIndex
                  const isActive = i === stepIndex
                  return (
                    <View key={step.statut} style={s.timelineRow}>
                      <View style={s.timelineLeft}>
                        <View style={[s.timelineDot, isDone && s.timelineDotDone, isActive && { backgroundColor: step.color, borderColor: step.color }]}>
                          {isDone && <Ionicons name="checkmark" size={12} color="#fff" />}
                          {isActive && <View style={s.timelineDotInner} />}
                        </View>
                        {i < STATUT_STEPS.length - 1 && <View style={[s.timelineLine, isDone && s.timelineLineDone]} />}
                      </View>
                      <View style={s.timelineContent}>
                        <Text style={[s.timelineLabel, isDone && s.timelineLabelDone, isActive && { color: '#1a1a18', fontWeight: '700' }]}>
                          {step.next}
                        </Text>
                      </View>
                    </View>
                  )
                })}
              </View>
            </View>
          )}

          {/* Compte rendu */}
          {mission.statut === 'TERMINEE' && mission.compteRendu && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Compte rendu soumis</Text>
              <View style={s.crCard}>
                <View style={s.crRow}><Text style={s.crLabel}>Acte réalisé</Text><Text style={s.crValue}>{mission.compteRendu.acteRealise}</Text></View>
                <View style={s.crRow}><Text style={s.crLabel}>Description</Text><Text style={s.crValue}>{mission.compteRendu.description}</Text></View>
                {mission.compteRendu.recommandations && <View style={s.crRow}><Text style={s.crLabel}>Recommandations</Text><Text style={s.crValue}>{mission.compteRendu.recommandations}</Text></View>}
                {mission.compteRendu.suiteNecessaire && <View style={[s.crRow, { borderBottomWidth: 0 }]}><Text style={s.crLabel}>Suite nécessaire</Text><Text style={s.crValue}>{mission.compteRendu.suiteNecessaire}</Text></View>}
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
          )}

          {/* Récapitulatif financier */}
          <View style={s.financeCard}>
            <Text style={s.financeTitle}>Votre gain pour cette mission</Text>
            <View style={s.financeRow}><Text style={s.financeLabel}>Soin</Text><Text style={s.financeVal}>{mission.montantBase.toLocaleString()} F</Text></View>
            <View style={s.financeRow}><Text style={s.financeLabel}>Déplacement</Text><Text style={s.financeVal}>{mission.fraisDeplacement.toLocaleString()} F</Text></View>
            <View style={s.financeRow}><Text style={s.financeLabel}>Commission Waluma (10%)</Text><Text style={[s.financeVal, { color: '#dc2626' }]}>-{montantCommission.toLocaleString()} F</Text></View>
            <View style={[s.financeRow, s.financeTotalRow]}>
              <Text style={s.financeTotalLabel}>Votre gain net</Text>
              <Text style={s.financeTotalVal}>{Math.round(mission.montantTotal * 0.9).toLocaleString()} FCFA</Text>
            </View>
            {paiementRecu ? (
              <View style={[s.paiementBadge, s.paiementPaye]}>
                <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                <Text style={[s.paiementText, { color: '#15803d' }]}>Paiement reçu — gain sécurisé</Text>
              </View>
            ) : mission.statut === 'TERMINEE' ? (
              <View style={s.impayeBlock}>
                <View style={[s.paiementBadge, s.paiementAttente]}>
                  <Ionicons name="time-outline" size={16} color="#d97706" />
                  <Text style={[s.paiementText, { color: '#d97706' }]}>En attente de paiement</Text>
                </View>
                <TouchableOpacity style={s.commissionBtn} onPress={() => setShowCommissionModal(true)} activeOpacity={0.88}>
                  <Ionicons name="cash-outline" size={18} color="#fff" />
                  <View>
                    <Text style={s.commissionBtnTitle}>Le patient m'a payé en espèces</Text>
                    <Text style={s.commissionBtnSub}>Régler ma commission — {montantCommission.toLocaleString()} FCFA</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Section avis + litige — mission terminée */}
          {mission.statut === 'TERMINEE' && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Avis & litige</Text>

              {/* Avis sur le patient */}
              {!avisExistant && !showAvisForm && (
                <TouchableOpacity style={s.avisBtn} onPress={() => setShowAvisForm(true)} activeOpacity={0.88}>
                  <Ionicons name="star-outline" size={18} color="#0d5068" />
                  <Text style={s.avisBtnText}>Donner un avis sur le patient</Text>
                </TouchableOpacity>
              )}

              {showAvisForm && (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={s.formCard}>
                    <Text style={s.formTitle}>Votre avis sur le patient</Text>
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
                      blurOnSubmit
                      onSubmitEditing={Keyboard.dismiss}
                    />
                    <View style={s.formBtns}>
                      <TouchableOpacity style={s.formCancelBtn} onPress={() => setShowAvisForm(false)}>
                        <Text style={s.formCancelText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.formConfirmBtn, avisLoading && { opacity: 0.6 }]} onPress={handleAvis} disabled={avisLoading}>
                        {avisLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.formConfirmText}>Envoyer</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              )}

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

              {/* Litige */}
              {!litigeExistant && !showLitigeForm && (
                <TouchableOpacity style={[s.litigeBtn, { marginTop: 10 }]} onPress={() => setShowLitigeForm(true)} activeOpacity={0.88}>
                  <Ionicons name="flag-outline" size={18} color="#dc2626" />
                  <Text style={s.litigeBtnText}>Signaler un problème</Text>
                </TouchableOpacity>
              )}

              {showLitigeForm && (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={[s.formCard, { marginTop: 10 }]}>
                    <Text style={s.formTitle}>Signaler un problème</Text>
                    <Text style={s.formLabel}>Motif <Text style={{ color: '#dc2626' }}>*</Text></Text>
                    <TextInput
                      style={s.formInput}
                      value={litigeMotif}
                      onChangeText={setLitigeMotif}
                      placeholder="Ex : Patient absent, refus de paiement..."
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
                      <TouchableOpacity style={[s.formConfirmBtn, { backgroundColor: '#dc2626' }, litigeLoading && { opacity: 0.6 }]} onPress={handleLitige} disabled={litigeLoading}>
                        {litigeLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.formConfirmText}>Envoyer</Text>}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              )}

              {litigeExistant && (() => {
                const cfg = LITIGE_STATUT_LABEL[litigeExistant.statut] ?? LITIGE_STATUT_LABEL.OUVERT
                return (
                  <View style={[s.litigeCard, { marginTop: 10 }]}>
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
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer — missions actives */}
      {!estTerminee && (
        <View style={s.footer}>
          {currentStep && (
            <TouchableOpacity style={[s.ctaBtn, { backgroundColor: currentStep.color }, actionLoading && s.ctaBtnDisabled]}
              onPress={() => handleAction(currentStep.action)} disabled={actionLoading} activeOpacity={0.88}>
              {actionLoading ? <ActivityIndicator color="#fff" /> : <><Text style={s.ctaBtnText}>{currentStep.label}</Text><Ionicons name="arrow-forward" size={18} color="#fff" /></>}
            </TouchableOpacity>
          )}
          {['ACCEPTEE', 'EN_ROUTE'].includes(mission.statut) && (
            <TouchableOpacity style={s.cancelBtn} onPress={handleAnnuler} disabled={actionLoading} activeOpacity={0.88}>
              <Ionicons name="close-circle-outline" size={18} color="#dc2626" />
              <Text style={s.cancelBtnText}>Annuler la mission</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal paiement commission */}
      <Modal visible={showCommissionModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Payer ma commission</Text>
              <TouchableOpacity onPress={() => setShowCommissionModal(false)} style={s.modalClose}>
                <Ionicons name="close" size={20} color="#5f5e5a" />
              </TouchableOpacity>
            </View>
            <View style={s.modalAmountCard}>
              <Text style={s.modalAmountLabel}>Commission Waluma (10%)</Text>
              <Text style={s.modalAmount}>{montantCommission.toLocaleString()} FCFA</Text>
              <Text style={s.modalAmountNote}>Mission totale : {mission.montantTotal.toLocaleString()} FCFA</Text>
            </View>
            <Text style={s.modalSectionLabel}>Choisir votre moyen de paiement</Text>
            <View style={s.operateursRow}>
              {OPERATEURS.map(op => (
                <TouchableOpacity key={op.key} style={[s.operateurBtn, operateur === op.key && { borderColor: op.color, backgroundColor: op.color + '15' }]}
                  onPress={() => setOperateur(op.key)} activeOpacity={0.8}>
                  <View style={[s.operateurDot, { backgroundColor: op.color }]} />
                  <Text style={[s.operateurLabel, operateur === op.key && { color: op.color, fontWeight: '700' }]}>{op.label}</Text>
                  {operateur === op.key && <Ionicons name="checkmark-circle" size={16} color={op.color} />}
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.modalInfo}>
              <Ionicons name="information-circle-outline" size={16} color="#0d5068" />
              <Text style={s.modalInfoText}>
                En confirmant, vous déclarez avoir reçu le paiement du patient et vous engagez à verser {montantCommission.toLocaleString()} FCFA via {OPERATEURS.find(o => o.key === operateur)?.label}.
              </Text>
            </View>
            <TouchableOpacity style={[s.modalConfirmBtn, paiementLoading && s.ctaBtnDisabled]}
              onPress={handlePaiementCommission} disabled={paiementLoading} activeOpacity={0.88}>
              {paiementLoading ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle" size={20} color="#fff" /><Text style={s.modalConfirmText}>Confirmer — {montantCommission.toLocaleString()} FCFA</Text></>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerGrad: {},
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#fff' },
  urgentBadge: { backgroundColor: '#dc2626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  urgentText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  statutCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#dcfce7', margin: 16, borderRadius: 14, padding: 14 },
  statutCardAnnulee: { backgroundColor: '#fee2e2' },
  statutText: { fontSize: 15, fontWeight: '700', color: '#15803d' },
  body: { flex: 1 },
  patientCard: { backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  patientAvatar: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  patientAvatarText: { fontSize: 20, fontWeight: '800', color: '#0d5068' },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '800', color: '#1a1a18', marginBottom: 2 },
  patientSpec: { fontSize: 12, fontWeight: '600', color: '#0d5068', marginBottom: 4 },
  patientAddr: { fontSize: 12, color: '#888780', lineHeight: 17 },
  patientActions: { gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  actionBtnGreen: { backgroundColor: '#dcfce7' },
  noteCard: { backgroundColor: '#fef3c7', marginHorizontal: 16, marginBottom: 8, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: '#fcd34d' },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  noteTitle: { fontSize: 12, fontWeight: '700', color: '#0d5068' },
  noteText: { fontSize: 13, color: '#5f5e5a', lineHeight: 19 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 12 },
  timeline: { backgroundColor: '#fff', borderRadius: 18, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 28 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f0eb', borderWidth: 1.5, borderColor: '#e5e4df', alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  timelineDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  timelineLine: { width: 1.5, flex: 1, backgroundColor: '#e5e4df', minHeight: 24, marginVertical: 4 },
  timelineLineDone: { backgroundColor: '#22c55e' },
  timelineContent: { flex: 1, paddingBottom: 24 },
  timelineLabel: { fontSize: 14, color: '#b4b2a9', fontWeight: '500' },
  timelineLabelDone: { color: '#22c55e' },
  crCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  crRow: { paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  crLabel: { fontSize: 11, fontWeight: '700', color: '#888780', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  crValue: { fontSize: 14, color: '#1a1a18', lineHeight: 20 },
  constantesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  constante: { flex: 1, minWidth: '45%', backgroundColor: '#f5f4ef', borderRadius: 12, padding: 10 },
  constanteLabel: { fontSize: 10, fontWeight: '600', color: '#888780', marginBottom: 4 },
  constanteVal: { fontSize: 16, fontWeight: '800', color: '#1a1a18' },
  constanteUnit: { fontSize: 11, fontWeight: '400', color: '#888780' },
  financeCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 16, borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  financeTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 14 },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  financeLabel: { fontSize: 13, color: '#888780' },
  financeVal: { fontSize: 13, fontWeight: '600', color: '#1a1a18' },
  financeTotalRow: { borderBottomWidth: 0, paddingTop: 12, marginTop: 4 },
  financeTotalLabel: { fontSize: 15, fontWeight: '800', color: '#1a1a18' },
  financeTotalVal: { fontSize: 15, fontWeight: '800', color: '#22c55e' },
  paiementBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, padding: 10, borderRadius: 12 },
  paiementPaye: { backgroundColor: '#dcfce7' },
  paiementAttente: { backgroundColor: '#fef3c7' },
  paiementText: { fontSize: 13, fontWeight: '700' },
  impayeBlock: { gap: 10 },
  commissionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0d5068', borderRadius: 14, padding: 14 },
  commissionBtnTitle: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 2 },
  commissionBtnSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  // Avis & Litige
  avisBtn: { backgroundColor: '#e0f2fe', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  avisBtnText: { fontSize: 14, fontWeight: '700', color: '#0d5068' },
  litigeBtn: { backgroundColor: '#fff5f5', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#fee2e2' },
  litigeBtnText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
  formCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, marginBottom: 10 },
  formTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a18', marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: '700', color: '#5f5e5a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, justifyContent: 'center' },
  formInput: { backgroundColor: '#f5f4ef', borderRadius: 12, padding: 14, fontSize: 14, color: '#1a1a18', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', marginBottom: 14, minHeight: 48 },
  formBtns: { flexDirection: 'row', gap: 10 },
  formCancelBtn: { flex: 1, borderRadius: 12, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: '#e5e4df' },
  formCancelText: { fontSize: 14, fontWeight: '600', color: '#888780' },
  formConfirmBtn: { flex: 1, borderRadius: 12, padding: 13, alignItems: 'center', backgroundColor: '#22c55e' },
  formConfirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  avisCard: { backgroundColor: '#fffbeb', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: '#fcd34d', marginBottom: 10 },
  avisHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  avisTitle: { fontSize: 13, fontWeight: '700', color: '#92400e', flex: 1 },
  avisStars: { flexDirection: 'row', gap: 2 },
  avisCommentaire: { fontSize: 13, color: '#78350f', lineHeight: 18 },
  litigeCard: { backgroundColor: '#fff5f5', borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: '#fca5a5' },
  litigeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  litigeTitle: { fontSize: 13, fontWeight: '700', color: '#dc2626', flex: 1 },
  litigeStatutBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  litigeStatutText: { fontSize: 11, fontWeight: '700' },
  litigeMotif: { fontSize: 13, fontWeight: '600', color: '#1a1a18', marginBottom: 4 },
  litigeDesc: { fontSize: 12, color: '#5f5e5a', lineHeight: 17 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)', gap: 10 },
  ctaBtn: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelBtn: { borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fca5a5' },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a18' },
  modalClose: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f5f4ef', alignItems: 'center', justifyContent: 'center' },
  modalAmountCard: { backgroundColor: '#0d5068', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20 },
  modalAmountLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  modalAmount: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  modalAmountNote: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  modalSectionLabel: { fontSize: 12, fontWeight: '700', color: '#888780', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  operateursRow: { gap: 8, marginBottom: 20 },
  operateurBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: '#e5e4df', borderRadius: 12, padding: 12 },
  operateurDot: { width: 10, height: 10, borderRadius: 5 },
  operateurLabel: { flex: 1, fontSize: 14, color: '#5f5e5a' },
  modalInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#e0f2fe', borderRadius: 12, padding: 12, marginBottom: 20 },
  modalInfoText: { flex: 1, fontSize: 12, color: '#0d5068', lineHeight: 17 },
  modalConfirmBtn: { backgroundColor: '#22c55e', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  modalConfirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})