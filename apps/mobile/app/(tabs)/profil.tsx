import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, StatusBar, Platform, ActivityIndicator, Image
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import { getUser, clearAuth, saveUser, User } from '@/lib/auth'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import api from '@/lib/api'

interface Stats {
  totalMissions: number
  missionsCetteAnnee: number
  noteMoyenne: number | null
}

export default function ProfilScreen() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats>({ totalMissions: 0, missionsCetteAnnee: 0, noteMoyenne: null })
  const [loadingStats, setLoadingStats] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const u = await getUser()
      setUser(u)
      if (u?.avatarUrl) setAvatarUrl(u.avatarUrl)
      try {
        const { data } = await api.get('/missions?limit=100')
        const missions = data.missions
        const anneeEnCours = new Date().getFullYear()
        const missionsCetteAnnee = missions.filter((m: { createdAt: string }) =>
          new Date(m.createdAt).getFullYear() === anneeEnCours
        ).length
        const terminées = missions.filter((m: { statut: string; avis?: { note: number } }) =>
          m.statut === 'TERMINEE' && m.avis?.note
        )
        const noteMoyenne = terminées.length
          ? terminées.reduce((a: number, m: { avis: { note: number } }) => a + m.avis.note, 0) / terminées.length
          : null
        setStats({ totalMissions: missions.length, missionsCetteAnnee, noteMoyenne })
      } catch {} finally {
        setLoadingStats(false)
      }
    }
    load()
  }, [])

  async function handleLogout() {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnexion', style: 'destructive', onPress: async () => { await clearAuth(); router.replace('/(auth)') } },
    ])
  }

  async function handleChangePhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à vos photos dans les réglages')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (result.canceled) return
    setUploadingPhoto(true)
    try {
      const uri = result.assets[0].uri
      const formData = new FormData()
      formData.append('file', { uri, name: 'avatar.jpg', type: 'image/jpeg' } as never)
      const { data } = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAvatarUrl(data.avatarUrl)
      // Mettre à jour le user local avec la nouvelle avatarUrl
      if (user) await saveUser({ ...user, avatarUrl: data.avatarUrl })
      Alert.alert('✓ Photo mise à jour')
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const sections = [
    {
      title: 'Mon compte',
      items: [
        { icon: 'person-circle-outline', label: 'Informations personnelles', sub: user?.telephone ?? '', onPress: () => router.push('/compte/infos' as never) },
        { icon: 'location-outline', label: 'Mes adresses', onPress: () => router.push('/compte/adresses' as never) },
        { icon: 'card-outline', label: 'Moyens de paiement', onPress: () => router.push('/compte/paiements' as never) },
      ],
    },
    {
      title: 'Préférences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/compte/notifications' as never) },
        { icon: 'language-outline', label: 'Langue', sub: 'Français', onPress: () => Alert.alert('Langue', 'Seul le français est disponible pour l\'instant.') },
      ],
    },
    {
      title: 'Informations légales',
      items: [
        { icon: 'shield-checkmark-outline', label: 'Politique de confidentialité', onPress: () => router.push({ pathname: '/compte/legal', params: { type: 'politique' } } as never) },
        { icon: 'document-text-outline', label: "Conditions d'utilisation", onPress: () => router.push({ pathname: '/compte/legal', params: { type: 'cgu' } } as never) },
        { icon: 'help-circle-outline', label: 'Aide et support', onPress: () => router.push({ pathname: '/compte/legal', params: { type: 'aide' } } as never) },
      ],
    },
  ]

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#0a3f52']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity style={s.avatarWrap} onPress={handleChangePhoto} disabled={uploadingPhoto}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={s.avatar} />
            ) : (
              <LinearGradient colors={['#22c55e', '#16a34a']} style={s.avatar}>
                <Text style={s.avatarText}>{(user?.prenom?.[0] ?? '') + (user?.nom?.[0] ?? '')}</Text>
              </LinearGradient>
            )}
            <View style={s.editAvatar}>
              {uploadingPhoto
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="camera" size={14} color="#fff" />
              }
            </View>
          </TouchableOpacity>
          <Text style={s.name}>{user?.prenom} {user?.nom}</Text>
          <Text style={s.phone}>{user?.telephone}</Text>
          <View style={s.statsRow}>
            {loadingStats ? (
              <ActivityIndicator color="rgba(255,255,255,0.5)" />
            ) : (
              [
                { label: 'Soins', value: stats.totalMissions.toString() },
                { label: 'Cette année', value: stats.missionsCetteAnnee.toString() },
                { label: 'Note moy.', value: stats.noteMoyenne ? `${stats.noteMoyenne.toFixed(1)}★` : '—' },
              ].map((stat, i) => (
                <View key={stat.label} style={[s.statItem, i < 2 && s.statBorder]}>
                  <Text style={s.statValue}>{stat.value}</Text>
                  <Text style={s.statLabel}>{stat.label}</Text>
                </View>
              ))
            )}
          </View>
        </View>
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
                  <View style={s.iconWrap}>
                    <Ionicons name={item.icon as never} size={20} color="#0d5068" />
                  </View>
                  <View style={s.rowInfo}>
                    <Text style={s.rowLabel}>{item.label}</Text>
                    {item.sub && <Text style={s.rowSub}>{item.sub}</Text>}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#d1d0c9" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
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
  header: { paddingHorizontal: 20, paddingBottom: 24, alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  editAvatar: { position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: 8, backgroundColor: '#0d5068', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 3 },
  phone: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 20 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', width: '100%', minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  statItem: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.15)' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  body: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  iconWrap: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a18' },
  rowSub: { fontSize: 11, color: '#888780', marginTop: 1 },
  logoutBtn: { backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#fee2e2' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },
  version: { fontSize: 11, color: '#b4b2a9', textAlign: 'center', marginTop: 16 },
})