import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, StatusBar, Platform
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import { getUser, clearAuth, User } from '@/lib/auth'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

interface MenuItem {
  icon: string
  iconLib?: 'Ionicons' | 'MaterialCommunityIcons'
  label: string
  sub?: string
  onPress: () => void
  danger?: boolean
  badge?: string
}

export default function ProfilScreen() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => { getUser().then(setUser) }, [])

  async function handleLogout() {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion', style: 'destructive',
          onPress: async () => { await clearAuth(); router.replace('/(auth)') },
        },
      ]
    )
  }

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Mon compte',
      items: [
        { icon: 'person-circle-outline', label: 'Informations personnelles', sub: user?.telephone ?? '', onPress: () => {} },
        { icon: 'location-outline', label: 'Mes adresses', onPress: () => {} },
        { icon: 'card-outline', label: 'Moyens de paiement', onPress: () => {} },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
        { icon: 'language-outline', label: 'Langue', sub: 'Français', onPress: () => {} },
      ],
    },
    {
      title: 'Informations légales',
      items: [
        { icon: 'shield-checkmark-outline', label: 'Politique de confidentialité', onPress: () => {} },
        { icon: 'document-text-outline', label: "Conditions d'utilisation", onPress: () => {} },
        { icon: 'help-circle-outline', label: 'Aide et support', onPress: () => {} },
      ],
    },
  ]

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#0a3f52']} style={s.headerGrad}>
        <SafeAreaView>
          <View style={s.header}>
            <View style={s.avatarWrap}>
              <LinearGradient colors={['#22c55e', '#16a34a']} style={s.avatar}>
                <Text style={s.avatarText}>
                  {(user?.prenom?.[0] ?? '') + (user?.nom?.[0] ?? '')}
                </Text>
              </LinearGradient>
              <TouchableOpacity style={s.editAvatar}>
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={s.name}>{user?.prenom} {user?.nom}</Text>
            <Text style={s.phone}>{user?.telephone}</Text>

            {/* Stats rapides */}
            <View style={s.statsRow}>
              {[
                { label: 'Soins', value: '12' },
                { label: 'Cette année', value: '4' },
                { label: 'Note moy.', value: '4,8★' },
              ].map((stat, i) => (
                <View key={stat.label} style={[s.statItem, i < 2 && s.statBorder]}>
                  <Text style={s.statValue}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {sections.map(section => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.card}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[s.row, i < section.items.length - 1 && s.rowBorder]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[s.iconWrap, item.danger && s.iconWrapDanger]}>
                    <Ionicons
                      name={item.icon as never}
                      size={20}
                      color={item.danger ? '#dc2626' : '#0d5068'}
                    />
                  </View>
                  <View style={s.rowInfo}>
                    <Text style={[s.rowLabel, item.danger && s.rowLabelDanger]}>{item.label}</Text>
                    {item.sub && <Text style={s.rowSub}>{item.sub}</Text>}
                  </View>
                  {item.badge && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color="#d1d0c9" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Déconnexion */}
        <View style={s.section}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text style={s.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.version}>Waluma v1.0.0 · Dakar, Sénégal</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  headerGrad: {},
  header: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 0, paddingBottom: 24, alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  editAvatar: {
    position: 'absolute', bottom: -4, right: -4,
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: '#0d5068', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 3 },
  phone: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, overflow: 'hidden', width: '100%',
  },
  statItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  body: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  iconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  iconWrapDanger: { backgroundColor: '#fee2e2' },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a18' },
  rowLabelDanger: { color: '#dc2626' },
  rowSub: { fontSize: 11, color: '#888780', marginTop: 1 },
  badge: { backgroundColor: '#22c55e', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, marginRight: 4 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  logoutBtn: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1.5, borderColor: '#fee2e2',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },
  version: { fontSize: 11, color: '#b4b2a9', textAlign: 'center', marginTop: 16 },
})