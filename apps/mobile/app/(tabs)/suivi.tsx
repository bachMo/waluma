import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { connectSocket, joinMission, leaveMission } from '@/lib/socket'
import api from '@/lib/api'

interface Mission {
  id: string
  statut: string
  specialite: string
  adresseTexte: string
  montantTotal: number
  accepteeAt: string | null
  enRouteAt: string | null
  arriveeAt: string | null
  debutSoinAt: string | null
  finSoinAt: string | null
  paiement: { statut: string } | null
  praticien: { user: { nom: string; prenom: string; telephone: string } } | null
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

export default function SuiviScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>()
  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)

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
      } catch (e) {
        console.error('Socket error:', e)
      }
    }
    initSocket()

    return () => {
      clearInterval(interval)
      leaveMission(missionId)
    }
  }, [missionId])

  async function handleAnnuler() {
    Alert.alert(
      'Annuler la mission',
      'Voulez-vous vraiment annuler cette demande de soin ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            await api.patch(`/missions/${missionId}/statut`, { statut: 'ANNULEE' })
            router.replace('/(tabs)' as never)
          },
        },
      ]
    )
  }

  const currentIndex = mission ? STATUT_ORDER.indexOf(mission.statut) : 0
  const dejaPayee = mission?.paiement?.statut === 'PAYE'

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#0d5068" size="large" />
      </View>
    )
  }

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

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

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
                {!dejaPayee ? (
                  <TouchableOpacity
                    style={s.payBtn}
                    onPress={() => router.push({ pathname: '/(tabs)/paiement', params: { missionId: mission.id } })}
                    activeOpacity={0.88}
                  >
                    <Ionicons name="card" size={18} color="#fff" />
                    <Text style={s.payBtnText}>Payer maintenant</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={s.payeeBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                    <Text style={s.payeeBadgeText}>Payé</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={s.avisBtn}
                  onPress={() => router.push({ pathname: '/(tabs)/avis', params: { missionId: mission.id } })}
                  activeOpacity={0.88}
                >
                  <Ionicons name="star-outline" size={18} color="#0d5068" />
                  <Text style={s.avisBtnText}>Laisser un avis</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.litigeBtn}
                  onPress={() => router.push({ pathname: '/(tabs)/litige', params: { missionId: mission.id } } as never)}
                  activeOpacity={0.88}
                >
                  <Ionicons name="flag-outline" size={18} color="#dc2626" />
                  <Text style={s.litigeBtnText}>Signaler un problème</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : mission.statut === 'ANNULEE' ? (
            <>
              <View style={[s.termineeIcon, { backgroundColor: '#fee2e2' }]}>
                <Ionicons name="close-circle" size={44} color="#dc2626" />
              </View>
              <Text style={s.statusTitle}>Mission annulée</Text>
              <Text style={s.statusSub}>Cette mission a été annulée</Text>
              <TouchableOpacity
                style={[s.payBtn, { marginTop: 16, backgroundColor: '#0d5068' }]}
                onPress={() => router.replace('/(tabs)' as never)}
              >
                <Text style={s.payBtnText}>Retour à l'accueil</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={s.activeIcon}>
                <Ionicons
                  name={STEPS.find(s => s.statut === mission.statut)?.icon as never ?? 'time'}
                  size={32} color="#0d5068"
                />
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
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => Alert.alert('Appeler', `${mission.praticien?.user.telephone} ?`)}
            >
              <Ionicons name="call" size={20} color="#0d5068" />
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline */}
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
  praticienCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  praticienAvatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  praticienAvatarText: { fontSize: 16, fontWeight: '700', color: '#0d5068' },
  praticienName: { fontSize: 15, fontWeight: '700', color: '#1a1a18', marginBottom: 2 },
  praticienSpec: { fontSize: 12, color: '#888780' },
  callBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 12 },
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
  detailCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  detailTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: 12 },
  detailRowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  detailLabel: { fontSize: 13, color: '#888780' },
  detailVal: { fontSize: 13, color: '#1a1a18', fontWeight: '600', textAlign: 'right', flex: 1 },
  detailValGreen: { color: '#22c55e', fontSize: 14, fontWeight: '800' },
})