import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

export default function ZoneScreen() {
  const [zones, setZones] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/praticiens/me')
        setZones(data.zoneIntervention || [])
      } catch {} finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Zone d'intervention</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.infoCard}>
          <Ionicons name="information-circle" size={20} color="#0d5068" />
          <Text style={s.infoText}>
            Votre zone d'intervention est définie par l'administrateur Waluma lors de votre inscription. Pour la modifier, contactez notre équipe.
          </Text>
        </View>

        {loading ? (
          <View style={s.center}><ActivityIndicator color="#0d5068" /></View>
        ) : zones.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="location-outline" size={48} color="#d1d0c9" />
            <Text style={s.emptyTitle}>Zone non définie</Text>
            <Text style={s.emptySub}>Contactez l'équipe Waluma pour configurer votre zone</Text>
          </View>
        ) : (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Zones couvertes</Text>
            <View style={s.card}>
              {zones.map((zone, i) => (
                <View key={zone} style={[s.zoneRow, i < zones.length - 1 && s.rowBorder]}>
                  <View style={s.zoneIcon}>
                    <Ionicons name="location" size={18} color="#0d5068" />
                  </View>
                  <Text style={s.zoneLabel}>{zone}</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={s.section}>
  <TouchableOpacity
    style={s.contactBtn}
    onPress={() =>
      router.push({
        pathname: '/praticien-compte/demande',
        params: { type: 'ZONE' },
      } as never)
    }
  >
    <Ionicons name="mail-outline" size={18} color="#0d5068" />
    <Text style={s.contactBtnText}>Demander une modification</Text>
  </TouchableOpacity>
</View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  headerGrad: {},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  body: { flex: 1 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#e0f2fe', margin: 16, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(13,80,104,0.2)' },
  infoText: { flex: 1, fontSize: 13, color: '#0d5068', lineHeight: 19 },
  center: { marginTop: 40, alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a18' },
  emptySub: { fontSize: 13, color: '#888780', textAlign: 'center' },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  zoneIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  zoneLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1a1a18' },
  contactBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#0d5068' },
  contactBtnText: { fontSize: 14, fontWeight: '700', color: '#0d5068' },
})