import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Platform
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Mission {
  id: string
  specialite: string
  adresseTexte: string
  montantTotal: number
  montantBase: number
  fraisDeplacement: number
  urgence: boolean
  notePatient: string | null
  proposedAt: string
  patient: { nom: string; prenom: string; telephone: string }
}

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

export default function NouvelleMissionScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>()
  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [refusing, setRefusing] = useState(false)
  const [tempsRestant, setTempsRestant] = useState(300) // 5 minutes en secondes

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/missions/${missionId}`)
        setMission(data)
        // Calculer le temps restant depuis proposedAt
        if (data.proposedAt) {
          const elapsed = Math.floor((Date.now() - new Date(data.proposedAt).getTime()) / 1000)
          setTempsRestant(Math.max(0, 300 - elapsed))
        }
      } catch {
        Alert.alert('Erreur', 'Mission introuvable')
        router.back()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [missionId])

  // Compte à rebours
  useEffect(() => {
    if (tempsRestant <= 0) {
      Alert.alert('Temps écoulé', 'La mission a été proposée à un autre praticien.', [
        { text: 'OK', onPress: () => router.replace('/(praticien)' as never) }
      ])
      return
    }
    const timer = setInterval(() => setTempsRestant(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [tempsRestant])

  async function handleAccepter() {
    setAccepting(true)
    try {
      await api.post(`/missions/${missionId}/accepter`)
      Alert.alert('✓ Mission acceptée !', 'Rendez-vous chez le patient.', [
        { text: 'Voir la mission', onPress: () => router.replace({ pathname: '/(praticien)/mission', params: { missionId } } as never) }
      ])
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      Alert.alert('Erreur', err?.response?.data?.error || 'Impossible d\'accepter la mission')
    } finally {
      setAccepting(false)
    }
  }

  async function handleRefuser() {
    Alert.alert(
      'Refuser la mission',
      'Êtes-vous sûr de vouloir refuser cette mission ? Cela affectera votre taux d\'acceptation.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: async () => {
            setRefusing(true)
            try {
              await api.post(`/missions/${missionId}/refuser`)
              router.replace('/(praticien)' as never)
            } catch {
              Alert.alert('Erreur', 'Impossible de refuser la mission')
            } finally {
              setRefusing(false)
            }
          },
        },
      ]
    )
  }

  const minutes = Math.floor(tempsRestant / 60)
  const secondes = tempsRestant % 60
  const urgence = tempsRestant < 60

  if (loading) {
    return <View style={s.center}><ActivityIndicator color="#0d5068" size="large" /></View>
  }

  if (!mission) return null

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <Text style={s.headerTitle}>Nouvelle mission</Text>
          <View style={[s.timerBadge, urgence && s.timerBadgeUrgent]}>
            <Ionicons name="time-outline" size={14} color={urgence ? '#dc2626' : '#fff'} />
            <Text style={[s.timerText, urgence && s.timerTextUrgent]}>
              {minutes}:{secondes.toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={s.body}>
        {/* Mission urgente */}
        {mission.urgence && (
          <View style={s.urgentBanner}>
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text style={s.urgentText}>Mission urgente</Text>
          </View>
        )}

        {/* Carte mission */}
        <View style={s.missionCard}>
          <View style={s.missionHeader}>
            <View style={s.specIcon}>
              <MaterialCommunityIcons name="needle" size={28} color="#0d5068" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.specLabel}>{SPEC_LABEL[mission.specialite]}</Text>
              <Text style={s.adresse} numberOfLines={2}>{mission.adresseTexte}</Text>
            </View>
          </View>

          <View style={s.divider} />

          <View style={s.infoRow}>
            <Ionicons name="person-outline" size={16} color="#888780" />
            <Text style={s.infoText}>{mission.patient.prenom} {mission.patient.nom}</Text>
          </View>

          {mission.notePatient && (
            <View style={s.infoRow}>
              <Ionicons name="information-circle-outline" size={16} color="#888780" />
              <Text style={s.infoText} numberOfLines={2}>{mission.notePatient}</Text>
            </View>
          )}

          <View style={s.divider} />

          <View style={s.financeGrid}>
            <View style={s.financeItem}>
              <Text style={s.financeLabel}>Soin</Text>
              <Text style={s.financeVal}>{mission.montantBase.toLocaleString()} F</Text>
            </View>
            <View style={s.financeItem}>
              <Text style={s.financeLabel}>Déplacement</Text>
              <Text style={s.financeVal}>{mission.fraisDeplacement.toLocaleString()} F</Text>
            </View>
            <View style={s.financeItem}>
              <Text style={s.financeLabel}>Commission (10%)</Text>
              <Text style={[s.financeVal, { color: '#dc2626' }]}>
                -{Math.round(mission.montantTotal * 0.1).toLocaleString()} F
              </Text>
            </View>
            <View style={[s.financeItem, s.financeTotal]}>
              <Text style={s.financeTotalLabel}>Votre gain net</Text>
              <Text style={s.financeTotalVal}>{Math.round(mission.montantTotal * 0.9).toLocaleString()} FCFA</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.acceptBtn, accepting && s.btnDisabled]}
            onPress={handleAccepter}
            disabled={accepting || refusing}
            activeOpacity={0.88}
          >
            {accepting
              ? <ActivityIndicator color="#fff" />
              : <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={s.acceptBtnText}>Accepter la mission</Text>
              </>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.refusBtn, refusing && s.btnDisabled]}
            onPress={handleRefuser}
            disabled={accepting || refusing}
            activeOpacity={0.88}
          >
            {refusing
              ? <ActivityIndicator color="#dc2626" />
              : <>
                <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
                <Text style={s.refusBtnText}>Refuser</Text>
              </>
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerGrad: {},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  timerBadgeUrgent: { backgroundColor: '#fee2e2' },
  timerText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  timerTextUrgent: { color: '#dc2626' },
  body: { flex: 1, padding: 16 },
  urgentBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fee2e2', borderRadius: 14, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#fca5a5' },
  urgentText: { fontSize: 14, fontWeight: '800', color: '#dc2626' },
  missionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, marginBottom: 20 },
  missionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  specIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  specLabel: { fontSize: 17, fontWeight: '800', color: '#1a1a18', marginBottom: 6 },
  adresse: { fontSize: 13, color: '#5f5e5a', lineHeight: 18 },
  divider: { height: 0.5, backgroundColor: 'rgba(0,0,0,0.06)', marginVertical: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  infoText: { flex: 1, fontSize: 13, color: '#5f5e5a', lineHeight: 18 },
  financeGrid: { gap: 8 },
  financeItem: { flexDirection: 'row', justifyContent: 'space-between' },
  financeLabel: { fontSize: 13, color: '#888780' },
  financeVal: { fontSize: 13, fontWeight: '600', color: '#1a1a18' },
  financeTotal: { paddingTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)', marginTop: 4 },
  financeTotalLabel: { fontSize: 15, fontWeight: '800', color: '#1a1a18' },
  financeTotalVal: { fontSize: 15, fontWeight: '800', color: '#22c55e' },
  actions: { gap: 12 },
  acceptBtn: { backgroundColor: '#22c55e', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  acceptBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  refusBtn: { backgroundColor: '#fee2e2', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#fca5a5' },
  refusBtnText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },
  btnDisabled: { opacity: 0.6 },
})