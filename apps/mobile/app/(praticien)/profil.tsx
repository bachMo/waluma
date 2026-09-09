import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, StatusBar, Platform, ActivityIndicator, Image
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import { getUser, clearAuth, User } from '@/lib/auth'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import api from '@/lib/api'

interface PraticienData {
  id: string
  statutCompte: string
  totalMissions: number
  noteMoyenne: number | null
  specialites: { specialite: string; principale: boolean }[]
  documents: { id: string; type: string; statut: string }[]
}

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Infirmier·ère IDE', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapeute',
  PRELEVEUR: 'Préleveur·se', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

export default function PraticienProfilScreen() {
  const [user, setUser] = useState<User | null>(null)
  const [praticien, setPraticien] = useState<PraticienData | null>(null)
  const [totalMissions, setTotalMissions] = useState(0)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUri, setPhotoUri] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const u = await getUser()
      setUser(u)
      try {
        const [praticienRes, missionsRes] = await Promise.all([
          api.get('/praticiens/me'),
          api.get('/missions?limit=100'),
        ])
        setPraticien(praticienRes.data)
        // Compter toutes les missions terminées du praticien
        const terminées = missionsRes.data.missions.filter(
          (m: { statut: string }) => m.statut === 'TERMINEE'
        ).length
        setTotalMissions(terminées)
      } catch {}
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
      setPhotoUri(result.assets[0].uri)
    } catch {
      Alert.alert('Erreur', 'Impossible de changer la photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  function bientotDisponible() {
    Alert.alert('Bientôt disponible', 'Cette fonctionnalité sera disponible dans une prochaine version.')
  }

const sections = [
  {
    title: 'Mon activité',
    items: [
      { icon: 'clipboard-outline', label: 'Mes missions', sub: `${totalMissions} mission(s) terminée(s)`, onPress: () => router.push('/praticien-compte/missions' as never) },
      { icon: 'wallet-outline', label: 'Mes gains', onPress: () => router.push('/(praticien)/gains') },
      { icon: 'star-outline', label: 'Mes avis', sub: praticien?.noteMoyenne ? `${praticien.noteMoyenne.toFixed(1)} / 5` : 'Aucun avis', onPress: () => router.push('/praticien-compte/avis' as never) },
    ],
  },
  {
    title: 'Mon profil professionnel',
    items: [
      { icon: 'document-text-outline', label: 'Mes documents', sub: `${praticien?.documents.length ?? 0} document(s)`, onPress: () => router.push('/praticien-compte/documents' as never) },
      { icon: 'location-outline', label: 'Zone d\'intervention', onPress: () => router.push('/praticien-compte/zone' as never) },
      { icon: 'medical-outline', label: 'Mes spécialités', onPress: () => router.push('/praticien-compte/specialites' as never) },
      { icon: 'document-outline', label: 'Mes demandes', onPress: () => router.push('/praticien-compte/mes-demandes' as never) },
    ],
  },
  {
    title: 'Compte',
    items: [
{ icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/praticien-compte/notifications' as never) },
{ icon: 'shield-checkmark-outline', label: 'Politique de confidentialité', onPress: () => router.push({ pathname: '/praticien-compte/legal', params: { type: 'politique' } } as never) },
{ icon: 'help-circle-outline', label: 'Aide et support', onPress: () => router.push({ pathname: '/praticien-compte/legal', params: { type: 'aide' } } as never) },
    ],
  },
]

  const statutConfig = {
    VALIDE: { label: 'Compte validé', color: '#22c55e', bg: '#dcfce7' },
    EN_ATTENTE: { label: 'Validation en cours', color: '#d97706', bg: '#fef3c7' },
    SUSPENDU: { label: 'Compte suspendu', color: '#dc2626', bg: '#fee2e2' },
    REFUSE: { label: 'Compte refusé', color: '#dc2626', bg: '#fee2e2' },
  }

  const statut = praticien?.statutCompte ?? 'EN_ATTENTE'
  const sc = statutConfig[statut as keyof typeof statutConfig] ?? statutConfig.EN_ATTENTE

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity style={s.avatarWrap} onPress={handleChangePhoto} disabled={uploadingPhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.avatar} />
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
          {praticien && (
            <Text style={s.spec}>
              {SPEC_LABEL[praticien.specialites.find(s => s.principale)?.specialite ?? ''] ?? ''}
            </Text>
          )}
          <View style={[s.statutBadge, { backgroundColor: sc.bg }]}>
            <View style={[s.statutDot, { backgroundColor: sc.color }]} />
            <Text style={[s.statutText, { color: sc.color }]}>{sc.label}</Text>
          </View>

          <View style={s.statsRow}>
            {[
              { label: 'Missions', value: totalMissions.toString() },
              { label: 'Note', value: praticien?.noteMoyenne ? `${praticien.noteMoyenne.toFixed(1)} ★` : '—' },
              { label: 'Documents', value: (praticien?.documents.length ?? 0).toString() },
            ].map((stat, i) => (
              <View key={stat.label} style={[s.statItem, i < 2 && s.statBorder]}>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
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
        <Text style={s.version}>Waluma Praticien v1.0.0</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  headerGrad: {},
  header: { paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  editAvatar: { position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: 8, backgroundColor: '#0d5068', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 3 },
  spec: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 12 },
  statutBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, marginBottom: 20 },
  statutDot: { width: 8, height: 8, borderRadius: 4 },
  statutText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', width: '100%' },
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