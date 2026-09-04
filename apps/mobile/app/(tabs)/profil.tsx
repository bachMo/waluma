import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import { getUser, clearAuth, User } from '@/lib/auth'

export default function ProfilScreen() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    getUser().then(setUser)
  }, [])

  async function handleLogout() {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion', style: 'destructive',
          onPress: async () => {
            await clearAuth()
            router.replace('/(auth)')
          },
        },
      ]
    )
  }

  const sections = [
    {
      title: 'Mon compte',
      items: [
        { icon: '👤', label: 'Informations personnelles', onPress: () => {} },
        { icon: '📍', label: 'Mes adresses', onPress: () => {} },
        { icon: '💳', label: 'Moyens de paiement', onPress: () => {} },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { icon: '🔔', label: 'Notifications', onPress: () => {} },
        { icon: '🌐', label: 'Langue', onPress: () => {} },
      ],
    },
    {
      title: 'Informations',
      items: [
        { icon: '🔒', label: 'Politique de confidentialité', onPress: () => {} },
        { icon: '📋', label: "Conditions d'utilisation", onPress: () => {} },
        { icon: '❓', label: 'Aide et support', onPress: () => {} },
      ],
    },
  ]

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {(user?.prenom?.[0] ?? '') + (user?.nom?.[0] ?? '')}
          </Text>
        </View>
        <Text style={s.name}>{user?.prenom} {user?.nom}</Text>
        <Text style={s.phone}>{user?.telephone}</Text>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {sections.map(section => (
          <View key={section.title}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.card}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[s.row, i < section.items.length - 1 && s.rowBorder]}
                  onPress={item.onPress}
                >
                  <View style={s.iconWrap}>
                    <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  </View>
                  <Text style={s.rowLabel}>{item.label}</Text>
                  <Text style={s.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Déconnexion */}
        <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 32 }}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
            <Text style={s.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f4ef' },
  header: {
    backgroundColor: '#0d5068', padding: 24, paddingTop: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  name: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 3 },
  phone: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  body: { flex: 1 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#888780',
    marginHorizontal: 16, marginTop: 20, marginBottom: 8,
  },
  card: {
    marginHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: 14,
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  iconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#f1f0eb', alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1a1a18' },
  chevron: { fontSize: 18, color: '#d1d0c9', fontWeight: '600' },
  logoutBtn: {
    borderWidth: 1, borderColor: '#fee2e2',
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: '#dc2626' },
})