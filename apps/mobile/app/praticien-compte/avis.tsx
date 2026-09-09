import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Avis {
  id: string
  note: number
  commentaire: string | null
  tags: string[]
  createdAt: string
  patient: { nom: string; prenom: string }
  mission: { specialite: string }
}

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

export default function AvisScreen() {
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [noteMoyenne, setNoteMoyenne] = useState<number | null>(null)

  async function load() {
    try {
      const praticienRes = await api.get('/praticiens/me')
      const praticienId = praticienRes.data.id
      setNoteMoyenne(praticienRes.data.noteMoyenne)
      const { data } = await api.get(`/avis/praticien/${praticienId}?limit=50`)
      setAvis(data.avis)
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])
  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [])

  function Stars({ note }: { note: number }) {
    return (
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[1,2,3,4,5].map(i => (
          <Ionicons key={i} name="star" size={14} color={i <= note ? '#f59e0b' : '#e5e4df'} />
        ))}
      </View>
    )
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Mes avis</Text>
          <View style={{ width: 36 }} />
        </View>

        {noteMoyenne !== null && (
          <View style={s.statsCard}>
            <Text style={s.statNote}>{noteMoyenne.toFixed(1)}</Text>
            <View style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', gap: 3 }}>
                {[1,2,3,4,5].map(i => (
                  <Ionicons key={i} name="star" size={18} color={i <= Math.round(noteMoyenne) ? '#f59e0b' : 'rgba(255,255,255,0.2)'} />
                ))}
              </View>
              <Text style={s.statCount}>{avis.length} avis au total</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#0d5068" size="large" /></View>
      ) : avis.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="star-outline" size={48} color="#d1d0c9" />
          <Text style={s.emptyTitle}>Aucun avis pour l'instant</Text>
          <Text style={s.emptySub}>Les avis de vos patients apparaîtront ici</Text>
        </View>
      ) : (
        <ScrollView
          style={s.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
        >
          <View style={s.list}>
            {avis.map(a => (
              <View key={a.id} style={s.avisCard}>
                <View style={s.avisHeader}>
                  <View style={s.patientAvatar}>
                    <Text style={s.patientAvatarText}>{a.patient.prenom[0]}{a.patient.nom[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.patientName}>{a.patient.prenom} {a.patient.nom}</Text>
                    <Text style={s.missionSpec}>{SPEC_LABEL[a.mission.specialite]}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Stars note={a.note} />
                    <Text style={s.avisDate}>
                      {new Date(a.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
                {a.commentaire && (
                  <Text style={s.commentaire}>"{a.commentaire}"</Text>
                )}
                {a.tags.length > 0 && (
                  <View style={s.tags}>
                    {a.tags.map(tag => (
                      <View key={tag} style={s.tag}>
                        <Text style={s.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  statsCard: { flexDirection: 'row', alignItems: 'center', gap: 16, marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 },
  statNote: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  statCount: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a18' },
  emptySub: { fontSize: 13, color: '#888780', textAlign: 'center' },
  body: { flex: 1 },
  list: { padding: 16, gap: 12 },
  avisCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  avisHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  patientAvatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  patientAvatarText: { fontSize: 14, fontWeight: '700', color: '#0d5068' },
  patientName: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 2 },
  missionSpec: { fontSize: 12, color: '#888780' },
  avisDate: { fontSize: 11, color: '#b4b2a9' },
  commentaire: { fontSize: 14, color: '#3a3a38', lineHeight: 20, fontStyle: 'italic', marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#e0f2fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  tagText: { fontSize: 11, fontWeight: '600', color: '#0d5068' },
})