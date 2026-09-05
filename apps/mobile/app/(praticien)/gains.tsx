import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator, RefreshControl
} from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Mission {
  id: string
  statut: string
  specialite: string
  montantTotal: number
  finSoinAt: string | null
  createdAt: string
  patient: { nom: string; prenom: string }
}

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

export default function GainsScreen() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const { data } = await api.get('/missions?limit=50')
      setMissions(data.missions.filter((m: Mission) => m.statut === 'TERMINEE'))
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])
  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [])

  const gainBrut = missions.reduce((sum, m) => sum + m.montantTotal, 0)
  const commission = Math.round(gainBrut * 0.1)
  const gainNet = gainBrut - commission
  const moisEnCours = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

  // Grouper par mois
  const grouped = missions.reduce((acc, m) => {
    const date = new Date(m.finSoinAt || m.createdAt)
    const key = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {} as Record<string, Mission[]>)

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <SafeAreaView>
          <View style={s.header}>
            <Text style={s.headerTitle}>Mes gains</Text>
            <Text style={s.headerSub}>{moisEnCours}</Text>
          </View>

          {/* Carte gains */}
          <View style={s.gainsCard}>
            <View style={s.gainMain}>
              <Text style={s.gainLabel}>Gain net total</Text>
              <Text style={s.gainValue}>{gainNet.toLocaleString()}</Text>
              <Text style={s.gainCurrency}>FCFA</Text>
            </View>
            <View style={s.gainDetails}>
              <View style={s.gainRow}>
                <View style={s.gainDot} />
                <Text style={s.gainDetailLabel}>Brut</Text>
                <Text style={s.gainDetailVal}>{gainBrut.toLocaleString()} F</Text>
              </View>
              <View style={s.gainRow}>
                <View style={[s.gainDot, { backgroundColor: '#dc2626' }]} />
                <Text style={s.gainDetailLabel}>Commission (10%)</Text>
                <Text style={[s.gainDetailVal, { color: '#dc2626' }]}>-{commission.toLocaleString()} F</Text>
              </View>
            </View>

            <View style={s.gainStats}>
              {[
                { label: 'Missions', value: missions.length.toString() },
                { label: 'Moy. / mission', value: missions.length ? `${Math.round(gainNet / missions.length).toLocaleString()} F` : '—' },
              ].map(stat => (
                <View key={stat.label} style={s.gainStat}>
                  <Text style={s.gainStatVal}>{stat.value}</Text>
                  <Text style={s.gainStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
      >
        {loading ? (
          <ActivityIndicator color="#0d5068" style={{ marginTop: 40 }} />
        ) : missions.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="wallet-outline" size={48} color="#d1d0c9" />
            <Text style={s.emptyTitle}>Aucune mission terminée</Text>
            <Text style={s.emptySub}>Vos gains apparaîtront ici après chaque mission</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([mois, missionsMois]) => {
            const netMois = Math.round(missionsMois.reduce((s, m) => s + m.montantTotal, 0) * 0.9)
            return (
              <View key={mois} style={s.monthSection}>
                <View style={s.monthHeader}>
                  <Text style={s.monthTitle}>{mois}</Text>
                  <Text style={s.monthTotal}>{netMois.toLocaleString()} F net</Text>
                </View>
                {missionsMois.map((m, i) => (
                  <View
                    key={m.id}
                    style={[s.transactionRow, i < missionsMois.length - 1 && s.transactionBorder]}
                  >
                    <View style={s.transactionIcon}>
                      <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    </View>
                    <View style={s.transactionInfo}>
                      <Text style={s.transactionSpec}>{SPEC_LABEL[m.specialite]}</Text>
                      <Text style={s.transactionPatient}>{m.patient.prenom} {m.patient.nom}</Text>
                      <Text style={s.transactionDate}>
                        {new Date(m.finSoinAt || m.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short',
                        })}
                      </Text>
                    </View>
                    <View style={s.transactionRight}>
                      <Text style={s.transactionNet}>
                        +{Math.round(m.montantTotal * 0.9).toLocaleString()} F
                      </Text>
                      <Text style={s.transactionBrut}>
                        Brut: {m.montantTotal.toLocaleString()} F
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )
          })
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  headerGrad: {},
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2, marginBottom: 16 },
  gainsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16,
    borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  gainMain: { alignItems: 'center', marginBottom: 20 },
  gainLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginBottom: 4 },
  gainValue: { fontSize: 44, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  gainCurrency: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: 2 },
  gainDetails: { gap: 8, marginBottom: 20 },
  gainRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gainDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  gainDetailLabel: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  gainDetailVal: { fontSize: 13, fontWeight: '700', color: '#fff' },
  gainStats: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16, gap: 1 },
  gainStat: { flex: 1, alignItems: 'center' },
  gainStatVal: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  gainStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  body: { flex: 1 },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a18', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#888780', textAlign: 'center' },
  monthSection: { paddingHorizontal: 16, marginTop: 20 },
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  monthTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780' },
  monthTotal: { fontSize: 13, fontWeight: '700', color: '#22c55e' },
  transactionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 0,
  },
  transactionBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  transactionIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  transactionInfo: { flex: 1 },
  transactionSpec: { fontSize: 13, fontWeight: '700', color: '#1a1a18', marginBottom: 2 },
  transactionPatient: { fontSize: 12, color: '#5f5e5a', marginBottom: 2 },
  transactionDate: { fontSize: 11, color: '#b4b2a9' },
  transactionRight: { alignItems: 'flex-end' },
  transactionNet: { fontSize: 14, fontWeight: '800', color: '#22c55e', marginBottom: 2 },
  transactionBrut: { fontSize: 10, color: '#b4b2a9' },
})