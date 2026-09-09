import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform, Linking
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Document {
  id: string
  type: string
  nom: string
  url: string
  statut: string
  commentaireAdmin: string | null
  createdAt: string
}

const TYPE_LABEL: Record<string, string> = {
  DIPLOME: 'Diplôme', CNI: "Carte Nationale d'Identité",
  CASIER_JUDICIAIRE: 'Casier judiciaire', ORDRE_PROFESSIONNEL: "Numéro d'ordre",
  AUTRE: 'Autre document',
}

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  EN_ATTENTE: { label: 'En attente', color: '#d97706', bg: '#fef3c7', icon: 'time-outline' },
  VALIDE: { label: 'Validé', color: '#15803d', bg: '#dcfce7', icon: 'checkmark-circle-outline' },
  REFUSE: { label: 'Refusé', color: '#dc2626', bg: '#fee2e2', icon: 'close-circle-outline' },
}

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const { data } = await api.get('/praticiens/me')
      setDocuments(data.documents)
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])
  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [])

  const valides = documents.filter(d => d.statut === 'VALIDE').length
  const enAttente = documents.filter(d => d.statut === 'EN_ATTENTE').length
  const refuses = documents.filter(d => d.statut === 'REFUSE').length

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Mes documents</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={s.statsRow}>
          {[
            { label: 'Validés', value: valides, color: '#22c55e' },
            { label: 'En attente', value: enAttente, color: '#f59e0b' },
            { label: 'Refusés', value: refuses, color: '#ef4444' },
          ].map((s2, i) => (
            <View key={s2.label} style={[s.stat, i < 2 && s.statBorder]}>
              <Text style={[s.statValue, { color: s2.color }]}>{s2.value}</Text>
              <Text style={s.statLabel}>{s2.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#0d5068" size="large" /></View>
      ) : documents.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="document-outline" size={48} color="#d1d0c9" />
          <Text style={s.emptyTitle}>Aucun document</Text>
          <Text style={s.emptySub}>Vos documents de vérification apparaîtront ici</Text>
        </View>
      ) : (
        <ScrollView
          style={s.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
        >
          <View style={s.list}>
            {documents.map(doc => {
              const config = STATUT_CONFIG[doc.statut] ?? STATUT_CONFIG.EN_ATTENTE
              return (
                <View key={doc.id} style={s.docCard}>
                  <View style={s.docHeader}>
                    <View style={[s.docIcon, { backgroundColor: config.bg }]}>
                      <Ionicons name="document-text-outline" size={22} color={config.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.docType}>{TYPE_LABEL[doc.type] ?? doc.type}</Text>
                      <Text style={s.docNom} numberOfLines={1}>{doc.nom}</Text>
                      <Text style={s.docDate}>
                        {new Date(doc.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={[s.statutBadge, { backgroundColor: config.bg }]}>
                      <Ionicons name={config.icon as never} size={14} color={config.color} />
                      <Text style={[s.statutText, { color: config.color }]}>{config.label}</Text>
                    </View>
                  </View>
                  {doc.commentaireAdmin && doc.statut === 'REFUSE' && (
                    <View style={s.commentaire}>
                      <Text style={s.commentaireText}>💬 {doc.commentaireAdmin}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={s.viewBtn}
                    onPress={() => Linking.openURL(doc.url)}
                  >
                    <Ionicons name="eye-outline" size={16} color="#0d5068" />
                    <Text style={s.viewBtnText}>Voir le document</Text>
                  </TouchableOpacity>
                </View>
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
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a18' },
  emptySub: { fontSize: 13, color: '#888780', textAlign: 'center' },
  body: { flex: 1 },
  list: { padding: 16, gap: 12 },
  docCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  docHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  docIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docType: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 2 },
  docNom: { fontSize: 12, color: '#888780', marginBottom: 2 },
  docDate: { fontSize: 11, color: '#b4b2a9' },
  statutBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statutText: { fontSize: 11, fontWeight: '700' },
  commentaire: { backgroundColor: '#fee2e2', borderRadius: 10, padding: 10, marginBottom: 12 },
  commentaireText: { fontSize: 12, color: '#991b1b', lineHeight: 18 },
  viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)' },
  viewBtnText: { fontSize: 13, fontWeight: '600', color: '#0d5068' },
})