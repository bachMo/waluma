import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Mission {
  id: string
  statut: string
  specialite: string
  adresseTexte: string
  montantTotal: number
  createdAt: string
  finSoinAt: string | null
  patient: { nom: string; prenom: string }
  paiement: { statut: string } | null
}

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

const STATUT_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  TERMINEE: { color: '#15803d', bg: '#dcfce7', label: 'Terminée' },
  TERMINEE_IMPAYEE: { color: '#d97706', bg: '#fef3c7', label: 'Paiement en attente' },
  ANNULEE: { color: '#dc2626', bg: '#fee2e2', label: 'Annulée' },
  EN_ATTENTE: { color: '#d97706', bg: '#fef3c7', label: 'En attente' },
  ACCEPTEE: { color: '#0d5068', bg: '#e0f2fe', label: 'Acceptée' },
  EN_COURS: { color: '#7c3aed', bg: '#ede9fe', label: 'En cours' },
}

export default function MissionsHistoriqueScreen() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const { data } = await api.get('/missions?limit=100')
      setMissions(data.missions)
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])
  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [])

  const termineesPaye = missions.filter(m => m.statut === 'TERMINEE' && m.paiement?.statut === 'PAYE').length
  const gainTotal = Math.round(missions
    .filter(m => m.statut === 'TERMINEE' && m.paiement?.statut === 'PAYE')
    .reduce((sum, m) => sum + m.montantTotal * 0.9, 0))

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Mes missions</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={s.statsRow}>
          {[
            { label: 'Total', value: missions.length.toString() },
            { label: 'Payées', value: termineesPaye.toString() },
            { label: 'Gain net', value: `${gainTotal.toLocaleString()} F` },
          ].map((stat, i) => (
            <View key={stat.label} style={[s.stat, i < 2 && s.statBorder]}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#0d5068" size="large" /></View>
      ) : missions.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="clipboard-outline" size={48} color="#d1d0c9" />
          <Text style={s.emptyTitle}>Aucune mission</Text>
        </View>
      ) : (
        <ScrollView
          style={s.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
        >
          <View style={s.list}>
            {missions.map(m => {
              const statutKey = m.statut === 'TERMINEE' && m.paiement?.statut !== 'PAYE'
                ? 'TERMINEE_IMPAYEE'
                : m.statut
              const config = STATUT_CONFIG[statutKey] ?? STATUT_CONFIG.EN_ATTENTE
              return (
                <TouchableOpacity
                  key={m.id}
                  style={s.missionCard}
                  onPress={() => router.push({ pathname: '/(praticien)/mission', params: { missionId: m.id } })}
                  activeOpacity={0.85}
                >
                  <View style={[s.missionIcon, { backgroundColor: config.bg }]}>
                    <Ionicons name="medical-outline" size={20} color={config.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.missionSpec}>{SPEC_LABEL[m.specialite]}</Text>
                    <Text style={s.missionPatient}>{m.patient.prenom} {m.patient.nom}</Text>
                    <Text style={s.missionDate}>
                      {new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={[s.statutBadge, { backgroundColor: config.bg }]}>
                      <Text style={[s.statutText, { color: config.color }]}>{config.label}</Text>
                    </View>
                    {m.statut === 'TERMINEE' && m.paiement?.statut === 'PAYE' && (
                      <Text style={s.gainText}>+{Math.round(m.montantTotal * 0.9).toLocaleString()} F</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  headerGrad: {},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' },
  stat: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a18' },
  body: { flex: 1 },
  list: { padding: 16, gap: 10 },
  missionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  missionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  missionSpec: { fontSize: 13, fontWeight: '700', color: '#1a1a18', marginBottom: 2 },
  missionPatient: { fontSize: 12, color: '#5f5e5a', marginBottom: 2 },
  missionDate: { fontSize: 11, color: '#b4b2a9' },
  statutBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statutText: { fontSize: 10, fontWeight: '700' },
  gainText: { fontSize: 12, fontWeight: '700', color: '#22c55e' },
})