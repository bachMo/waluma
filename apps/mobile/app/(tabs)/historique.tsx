import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator,
  RefreshControl, StatusBar
} from 'react-native'
import { router } from 'expo-router'
import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Mission {
  id: string
  statut: string
  specialite: string
  adresseTexte: string
  montantTotal: number
  createdAt: string
  paiement: { statut: string } | null
  praticien: { user: { nom: string; prenom: string } } | null
}

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  TERMINEE:          { label: 'Terminé',                  color: '#15803d', bg: '#dcfce7', icon: 'checkmark-circle' },
  TERMINEE_IMPAYEE:  { label: 'Paiement en attente',      color: '#d97706', bg: '#fef3c7', icon: 'card' },
  EN_COURS:          { label: 'Soin en cours',             color: '#1d4ed8', bg: '#dbeafe', icon: 'medkit' },
  EN_ROUTE:          { label: 'En route',                  color: '#7c3aed', bg: '#ede9fe', icon: 'car' },
  ARRIVE:            { label: 'Arrivé',                    color: '#0891b2', bg: '#cffafe', icon: 'location' },
  ACCEPTEE:          { label: 'Acceptée',                  color: '#0d5068', bg: '#e0f2fe', icon: 'person' },
  EN_ATTENTE:        { label: 'En attente',                color: '#d97706', bg: '#fef3c7', icon: 'time' },
  ANNULEE:           { label: 'Annulée',                   color: '#dc2626', bg: '#fee2e2', icon: 'close-circle' },
  EXPIREE:           { label: 'Expirée',                   color: '#6b7280', bg: '#f3f4f6', icon: 'alert-circle' },
}

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

function getStatutKey(m: Mission): string {
  if (m.statut === 'TERMINEE' && m.paiement?.statut !== 'PAYE') return 'TERMINEE_IMPAYEE'
  return m.statut
}

export default function HistoriqueScreen() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const { data } = await api.get('/missions?limit=30')
      setMissions(data.missions)
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

useFocusEffect(useCallback(() => { load() }, []))
const onRefresh = useCallback(() => { setRefreshing(true); load() }, [])

  // Une mission TERMINEE non payée reste dans "En cours" côté patient
  const actives = missions.filter(m =>
    !['ANNULEE', 'EXPIREE'].includes(m.statut) &&
    !(m.statut === 'TERMINEE' && m.paiement?.statut === 'PAYE')
  )
  const passees = missions.filter(m =>
    m.statut === 'ANNULEE' ||
    m.statut === 'EXPIREE' ||
    (m.statut === 'TERMINEE' && m.paiement?.statut === 'PAYE')
  )

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#0a3f52']} style={s.header}>
        <SafeAreaView>
          <View style={s.headerContent}>
            <Text style={s.headerTitle}>Mes soins</Text>
            <Text style={s.headerSub}>{missions.length} soin{missions.length > 1 ? 's' : ''} au total</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#0d5068" size="large" />
        </View>
      ) : missions.length === 0 ? (
        <View style={s.empty}>
          <LinearGradient colors={['#e0f2fe', '#f0fdf4']} style={s.emptyIcon}>
            <MaterialCommunityIcons name="needle" size={40} color="#0d5068" />
          </LinearGradient>
          <Text style={s.emptyTitle}>Aucun soin pour l'instant</Text>
          <Text style={s.emptySub}>Vos demandes de soin apparaîtront ici</Text>
          <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/(tabs)/demande')}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={s.emptyBtnText}>Demander un soin</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={s.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
        >
          {actives.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>En cours</Text>
              {actives.map(m => <MissionCard key={m.id} mission={m} active />)}
            </View>
          )}

          {passees.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Historique</Text>
              {passees.map(m => <MissionCard key={m.id} mission={m} />)}
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  )
}

function MissionCard({ mission: m, active }: { mission: Mission; active?: boolean }) {
  const statutKey = getStatutKey(m)
  const config = STATUT_CONFIG[statutKey] ?? STATUT_CONFIG.EN_ATTENTE
  const isPaiementAttente = statutKey === 'TERMINEE_IMPAYEE'

  return (
    <TouchableOpacity
      style={[s.card, active && s.cardActive, isPaiementAttente && s.cardPaiementAttente]}
      onPress={() => router.push({ pathname: '/(tabs)/suivi', params: { missionId: m.id } })}
      activeOpacity={0.85}
    >
      <View style={[s.cardIcon, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon as never} size={22} color={config.color} />
      </View>
      <View style={s.cardInfo}>
        <Text style={s.cardSpec}>{SPEC_LABEL[m.specialite] ?? m.specialite}</Text>
        <Text style={s.cardPrat} numberOfLines={1}>
          {m.praticien ? `${m.praticien.user.prenom} ${m.praticien.user.nom}` : 'Recherche en cours...'}
        </Text>
        <Text style={s.cardDate}>
          {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>
      </View>
      <View style={s.cardRight}>
        <View style={[s.statusBadge, { backgroundColor: config.bg }]}>
          <Text style={[s.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={s.cardMontant}>{m.montantTotal.toLocaleString()} F</Text>
        {isPaiementAttente && (
          <TouchableOpacity
            style={s.payNowBtn}
            onPress={() => router.push({ pathname: '/(tabs)/paiement', params: { missionId: m.id } })}
          >
            <Text style={s.payNowText}>Payer</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  header: {},
  headerContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1a1a18', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#888780', textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#22c55e', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  body: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardActive: { borderWidth: 1.5, borderColor: '#22c55e' },
  cardPaiementAttente: { borderWidth: 1.5, borderColor: '#f59e0b' },
  cardIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardInfo: { flex: 1 },
  cardSpec: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 3 },
  cardPrat: { fontSize: 12, color: '#5f5e5a', marginBottom: 3 },
  cardDate: { fontSize: 11, color: '#b4b2a9', fontWeight: '500' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardMontant: { fontSize: 13, fontWeight: '700', color: '#1a1a18' },
  payNowBtn: { backgroundColor: '#22c55e', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  payNowText: { fontSize: 10, fontWeight: '800', color: '#fff' },
})