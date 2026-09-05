import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, Alert
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { connectSocket, joinMission, leaveMission, getSocket } from '@/lib/socket'

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
  praticien: { user: { nom: string; prenom: string; telephone: string } } | null
}

const STEPS = [
  { statut: 'ACCEPTEE', label: 'Praticien trouvé', icon: '✓' },
  { statut: 'EN_ROUTE', label: 'En route vers vous', icon: '🚗' },
  { statut: 'ARRIVE', label: 'Arrivé chez vous', icon: '📍' },
  { statut: 'EN_COURS', label: 'Soin en cours', icon: '💉' },
  { statut: 'TERMINEE', label: 'Soin terminé', icon: '✅' },
]

const STATUT_ORDER = ['EN_ATTENTE', 'ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS', 'TERMINEE']

const SPECIALITE_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

export default function SuiviScreen() {
  const { missionId } = useLocalSearchParams()
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
    // Connexion WebSocket
connectSocket().then(sock => {
  joinMission(missionId as string)
  sock.on('mission:statut', (data) => {
    if (data.missionId === missionId) {
      load() // Recharger les données
    }
  })
}).catch(console.error)

return () => {
  leaveMission(missionId as string)
  clearInterval(interval)
}
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [missionId])

  const currentIndex = mission ? STATUT_ORDER.indexOf(mission.statut) : 0

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <ActivityIndicator color="#0d5068" size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (!mission) return null

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Suivi de ma demande</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* Statut principal */}
        <View style={s.statusCard}>
          {mission.statut === 'EN_ATTENTE' ? (
            <>
              <ActivityIndicator color="#0d5068" style={{ marginBottom: 10 }} />
              <Text style={s.statusTitle}>Recherche d'un praticien...</Text>
              <Text style={s.statusSub}>Nous cherchons le meilleur praticien disponible près de vous</Text>
            </>
          ) : mission.statut === 'TERMINEE' ? (
            <>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>✅</Text>
              <Text style={s.statusTitle}>Soin terminé</Text>
              <Text style={s.statusSub}>Merci de votre confiance</Text>
              <TouchableOpacity
                style={s.rateBtn}
                onPress={() => router.push({ pathname: '/(tabs)/avis', params: { missionId: mission.id } })}
              >
                <Text style={s.rateBtnText}>Laisser un avis</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.statusTitle}>
                {STEPS.find(s => s.statut === mission.statut)?.label || mission.statut}
              </Text>
              <Text style={s.statusSub}>Mis à jour toutes les 15 secondes</Text>
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
              <Text style={s.praticienName}>
                {mission.praticien.user.prenom} {mission.praticien.user.nom}
              </Text>
              <Text style={s.praticienSpec}>{SPECIALITE_LABEL[mission.specialite]}</Text>
            </View>
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => Alert.alert('Appel', `Appeler ${mission.praticien?.user.telephone} ?`)}
            >
              <Text style={{ fontSize: 18 }}>📞</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Timeline */}
        <Text style={s.sectionTitle}>Progression</Text>
        <View style={s.timeline}>
          {STEPS.map((step, i) => {
            const stepIndex = STATUT_ORDER.indexOf(step.statut)
            const isDone = currentIndex >= stepIndex
            const isActive = currentIndex === stepIndex

            return (
              <View key={step.statut} style={s.step}>
                <View style={[
                  s.stepDot,
                  isDone && s.stepDotDone,
                  isActive && s.stepDotActive,
                ]}>
                  <Text style={s.stepDotText}>{isDone ? step.icon : ''}</Text>
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[s.stepLine, isDone && s.stepLineDone]} />
                )}
                <View style={s.stepInfo}>
                  <Text style={[s.stepLabel, isDone && s.stepLabelDone]}>{step.label}</Text>
                </View>
              </View>
            )
          })}
        </View>

        {/* Détails */}
        <View style={s.detailCard}>
          <Text style={s.detailTitle}>Détails de la demande</Text>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Type de soin</Text>
            <Text style={s.detailVal}>{SPECIALITE_LABEL[mission.specialite]}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Adresse</Text>
            <Text style={s.detailVal} numberOfLines={2}>{mission.adresseTexte}</Text>
          </View>
          <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={s.detailLabel}>Montant total</Text>
            <Text style={[s.detailVal, { fontWeight: '700', color: '#22c55e' }]}>
              {mission.montantTotal.toLocaleString()} FCFA
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f4ef' },
  header: {
    backgroundColor: '#0d5068', padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  statusCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16,
    padding: 20, alignItems: 'center',
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  statusTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a18', marginBottom: 6, textAlign: 'center' },
  statusSub: { fontSize: 13, color: '#888780', textAlign: 'center' },
  rateBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 14 },
  rateBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  praticienCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  praticienAvatar: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center',
  },
  praticienAvatarText: { fontSize: 14, fontWeight: '700', color: '#0d5068' },
  praticienName: { fontSize: 15, fontWeight: '700', color: '#1a1a18' },
  praticienSpec: { fontSize: 12, color: '#888780', marginTop: 2 },
  callBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#f1f0eb', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#888780',
    marginHorizontal: 16, marginTop: 4, marginBottom: 12,
  },
  timeline: { marginHorizontal: 16, marginBottom: 16 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#f1f0eb', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center', justifyContent: 'center', zIndex: 1, flexShrink: 0,
  },
  stepDotDone: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  stepDotActive: { backgroundColor: '#22c55e' },
  stepDotText: { fontSize: 12, color: '#fff' },
  stepLine: {
    position: 'absolute', left: 13, top: 28,
    width: 1.5, height: 32, backgroundColor: '#e5e4df',
  },
  stepLineDone: { backgroundColor: '#22c55e' },
  stepInfo: { flex: 1, marginLeft: 12, paddingBottom: 32 },
  stepLabel: { fontSize: 14, fontWeight: '500', color: '#b4b2a9' },
  stepLabelDone: { color: '#1a1a18', fontWeight: '600' },
  detailCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 14, padding: 14,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  detailTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 12 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)',
    gap: 12,
  },
  detailLabel: { fontSize: 13, color: '#888780' },
  detailVal: { fontSize: 13, color: '#1a1a18', textAlign: 'right', flex: 1 },
})