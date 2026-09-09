import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Platform
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const OPERATEURS = [
  { key: 'WAVE', label: 'Wave', icon: 'waves', color: '#1E88E5', bg: '#E3F2FD', desc: 'Paiement mobile instantané' },
  { key: 'ORANGE_MONEY', label: 'Orange Money', icon: 'cash', color: '#FF6600', bg: '#FFF3E0', desc: 'Orange Money Sénégal' },
  { key: 'FREE_MONEY', label: 'Free Money', icon: 'cellphone', color: '#E53935', bg: '#FFEBEE', desc: 'Free Money Sénégal' },
]

export default function PaiementsScreen() {
  function bientot() {
    Alert.alert(
      'Bientôt disponible',
      'La gestion des moyens de paiement sera disponible dans une prochaine mise à jour. Vous pouvez déjà payer via Wave, Orange Money et Free Money lors de vos soins.',
      [{ text: 'OK' }]
    )
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Moyens de paiement</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.infoCard}>
          <Ionicons name="information-circle" size={20} color="#0d5068" />
          <Text style={s.infoText}>
            Le paiement se fait après chaque soin directement via Mobile Money. Choisissez votre opérateur au moment du paiement.
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Opérateurs acceptés</Text>
          <View style={s.card}>
            {OPERATEURS.map((op, i) => (
              <View key={op.key} style={[s.opRow, i < OPERATEURS.length - 1 && s.rowBorder]}>
                <View style={[s.opIcon, { backgroundColor: op.bg }]}>
                  <MaterialCommunityIcons name={op.icon as never} size={22} color={op.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.opLabel}>{op.label}</Text>
                  <Text style={s.opDesc}>{op.desc}</Text>
                </View>
                <View style={s.activeBadge}>
                  <Text style={s.activeText}>Actif</Text>
                </View>
              </View>
            ))}
          </View>
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
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  opRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  opIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  opLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 2 },
  opDesc: { fontSize: 12, color: '#888780' },
  activeBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeText: { fontSize: 11, fontWeight: '700', color: '#15803d' },
  addBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: '#0d5068', borderStyle: 'dashed' },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#0d5068' },
})