import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, RefreshControl
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

interface Mission {
  id: string
  reference: string
  statut: string
  specialite: string
  adresseTexte: string
  montantTotal: number
  createdAt: string
  praticien: { user: { nom: string; prenom: string } } | null
}

const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée',
  EN_ROUTE: 'En route', ARRIVE: 'Arrivé',
  EN_COURS: 'Soin en cours', TERMINEE: 'Terminée',
  ANNULEE: 'Annulée', EXPIREE: 'Expirée',
}

const STATUT_COLOR: Record<string, string> = {
  TERMINEE: '#15803d', ANNULEE: '#991b1b', EXPIREE: '#991b1b',
  EN_ATTENTE: '#92400e', EN_COURS: '#1d4ed8',
}

const SPECIALITE_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
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

  useEffect(() => { load() }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load()
  }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Mes soins</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#0d5068" size="large" />
        </View>
      ) : missions.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🏥</Text>
          <Text style={s.emptyTitle}>Aucun soin pour l'instant</Text>
          <Text style={s.emptySub}>Vos demandes de soin apparaîtront ici</Text>
          <TouchableOpacity
            style={s.emptyBtn}
            onPress={() => router.push('/(tabs)/demande')}
          >
            <Text style={s.emptyBtnText}>Demander un soin</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={s.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
        >
          <View style={s.card}>
            {missions.map((m, i) => (
              <TouchableOpacity
                key={m.id}
                style={[s.row, i < missions.length - 1 && s.rowBorder]}
                onPress={() => router.push({ pathname: '/(tabs)/suivi', params: { missionId: m.id } })}
              >
                <View style={[s.icon, { backgroundColor: m.statut === 'TERMINEE' ? '#dcfce7' : m.statut === 'ANNULEE' ? '#fee2e2' : '#e0f2fe' }]}>
                  <Text style={{ fontSize: 18 }}>
                    {m.statut === 'TERMINEE' ? '✅' : m.statut === 'ANNULEE' ? '❌' : '⏳'}
                  </Text>
                </View>
                <View style={s.info}>
                  <Text style={s.specialite}>{SPECIALITE_LABEL[m.specialite] ?? m.specialite}</Text>
                  <Text style={s.praticien} numberOfLines={1}>
                    {m.praticien ? `${m.praticien.user.prenom} ${m.praticien.user.nom}` : 'En recherche de praticien'}
                  </Text>
                  <Text style={s.date}>{formatDate(m.createdAt)}</Text>
                </View>
                <View style={s.right}>
                  <Text style={[s.statut, { color: STATUT_COLOR[m.statut] ?? '#5f5e5a' }]}>
                    {STATUT_LABEL[m.statut] ?? m.statut}
                  </Text>
                  <Text style={s.montant}>{m.montantTotal.toLocaleString()} F</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f4ef' },
  header: { backgroundColor: '#0d5068', padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  body: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a18', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#888780', textAlign: 'center', marginBottom: 20 },
  emptyBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  specialite: { fontSize: 14, fontWeight: '600', color: '#1a1a18', marginBottom: 2 },
  praticien: { fontSize: 12, color: '#5f5e5a', marginBottom: 2 },
  date: { fontSize: 11, color: '#888780' },
  right: { alignItems: 'flex-end' },
  statut: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  montant: { fontSize: 13, fontWeight: '600', color: '#1a1a18' },
})