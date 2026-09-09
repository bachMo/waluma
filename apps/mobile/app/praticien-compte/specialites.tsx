import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Specialite {
  id: string
  specialite: string
  principale: boolean
}

const SPEC_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  INFIRMIER: { label: 'Infirmier·ère IDE', icon: 'needle', color: '#0d5068', bg: '#e0f2fe' },
  MEDECIN_GENERALISTE: { label: 'Médecin généraliste', icon: 'stethoscope', color: '#7c3aed', bg: '#ede9fe' },
  SAGE_FEMME: { label: 'Sage-femme', icon: 'baby-carriage', color: '#db2777', bg: '#fce7f3' },
  KINESITHERAPEUTE: { label: 'Kinésithérapeute', icon: 'human-handsup', color: '#d97706', bg: '#fef3c7' },
  PRELEVEUR: { label: 'Préleveur·se', icon: 'test-tube', color: '#0891b2', bg: '#cffafe' },
  PEDIATRE: { label: 'Pédiatre', icon: 'emoticon-happy-outline', color: '#16a34a', bg: '#dcfce7' },
  AUTRE: { label: 'Autre', icon: 'medical-bag', color: '#6b7280', bg: '#f3f4f6' },
}

export default function SpecialitesScreen() {
  const [specialites, setSpecialites] = useState<Specialite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/praticiens/me')
        setSpecialites(data.specialites)
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
          <Text style={s.headerTitle}>Mes spécialités</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.infoCard}>
          <Ionicons name="information-circle" size={20} color="#0d5068" />
          <Text style={s.infoText}>
            Vos spécialités sont configurées par l'équipe Waluma. Pour ajouter une spécialité, contactez-nous avec vos diplômes et certifications.
          </Text>
        </View>

        {loading ? (
          <View style={s.center}><ActivityIndicator color="#0d5068" /></View>
        ) : (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Spécialités enregistrées</Text>
            <View style={s.list}>
              {specialites.map(sp => {
                const config = SPEC_CONFIG[sp.specialite] ?? SPEC_CONFIG.AUTRE
                return (
                  <View key={sp.id} style={s.specCard}>
                    <View style={[s.specIcon, { backgroundColor: config.bg }]}>
                      <MaterialCommunityIcons name={config.icon as never} size={28} color={config.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.specLabel}>{config.label}</Text>
                      {sp.principale && (
                        <View style={s.princBadge}>
                          <Text style={s.princText}>Spécialité principale</Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
                  </View>
                )
              })}
            </View>
          </View>
        )}

        <View style={s.section}>
  <TouchableOpacity
    style={s.contactBtn}
    onPress={() =>
      router.push({
        pathname: '/praticien-compte/demande',
        params: { type: 'SPECIALITE' },
      } as never)
    }
  >
    <Ionicons name="add-circle-outline" size={18} color="#0d5068" />
    <Text style={s.contactBtnText}>Demander une nouvelle spécialité</Text>
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
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 10 },
  list: { gap: 10 },
  specCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  specIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  specLabel: { fontSize: 15, fontWeight: '700', color: '#1a1a18', marginBottom: 6 },
  princBadge: { backgroundColor: '#dcfce7', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  princText: { fontSize: 11, fontWeight: '700', color: '#15803d' },
  contactBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#0d5068', borderStyle: 'dashed' },
  contactBtnText: { fontSize: 14, fontWeight: '700', color: '#0d5068' },
})