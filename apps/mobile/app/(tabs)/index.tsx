import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Dimensions, Image, Alert
} from 'react-native'
import { router } from 'expo-router'
import { useState, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { getUser } from '@/lib/auth'
import api from '@/lib/api'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')

const SPECIALITES = [
  { key: 'INFIRMIER', label: 'Soins infirmiers', prix: '8 000', icon: 'needle', color: '#0d5068', bg: '#e0f2fe' },
  { key: 'MEDECIN_GENERALISTE', label: 'Médecin généraliste', prix: '15 000', icon: 'stethoscope', color: '#7c3aed', bg: '#ede9fe' },
  { key: 'PRELEVEUR', label: 'Prélèvement', prix: '5 000', icon: 'test-tube', color: '#0891b2', bg: '#cffafe' },
  { key: 'KINESITHERAPEUTE', label: 'Kinéthérapie', prix: '12 000', icon: 'human-handsup', color: '#d97706', bg: '#fef3c7' },
  { key: 'SAGE_FEMME', label: 'Sage-femme', prix: '12 000', icon: 'baby-carriage', color: '#db2777', bg: '#fce7f3' },
  { key: 'PEDIATRE', label: 'Pédiatre', prix: '15 000', icon: 'emoticon-happy-outline', color: '#16a34a', bg: '#dcfce7' },
]

const SPECIALITE_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

const STATUT_LABEL: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'Recherche d\'un praticien...', color: '#d97706' },
  ACCEPTEE: { label: 'Praticien assigné', color: '#0d5068' },
  EN_ROUTE: { label: 'Praticien en route', color: '#7c3aed' },
  ARRIVE: { label: 'Praticien arrivé', color: '#0891b2' },
  EN_COURS: { label: 'Soin en cours', color: '#22c55e' },
  TERMINEE: { label: 'Soin terminé — paiement en attente', color: '#d97706' },
}

interface Article {
  id: string
  titre: string
  categorie: string
  auteur: string
  imageUrl: string | null
}

interface MissionActive {
  id: string
  statut: string
  specialite: string
  adresseTexte: string
  paiements: { statut: string }[]
  praticien: { user: { prenom: string; nom: string } } | null
}

export default function HomeScreen() {
  const [userName, setUserName] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [missionActive, setMissionActive] = useState<MissionActive | null>(null)

  useFocusEffect(useCallback(() => {
    async function load() {
      const user = await getUser()
      if (user) setUserName(user.prenom)
      else { router.replace('/(auth)'); return }

      try {
        const { data } = await api.get('/articles?limit=2&statut=publié')
        setArticles(data.articles)
      } catch {}

      try {
        const { data } = await api.get('/missions?limit=10')
        const active = data.missions.find((m: { statut: string; paiements?: { statut: string }[] }) =>
          ['EN_ATTENTE', 'ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS'].includes(m.statut) ||
          (m.statut === 'TERMINEE' && m.paiements?.[0]?.statut !== 'PAYE')
        )
        setMissionActive(active ?? null)
      } catch {}
    }
    load()
  }, []))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={s.safeTop}>
        <LinearGradient colors={['#0d5068', '#0a3f52']} style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.greeting}>{greeting} 👋</Text>
              <Text style={s.userName}>{userName || '...'}</Text>
            </View>
            <TouchableOpacity
              style={s.notifBtn}
              onPress={() => Alert.alert('Notifications', 'Aucune nouvelle notification pour l\'instant.')}
            >
              <Ionicons name="notifications-outline" size={22} color="rgba(255,255,255,0.8)" />
              <View style={s.notifDot} />
            </TouchableOpacity>
          </View>

          {missionActive ? (
            <TouchableOpacity
              style={s.missionActiveCard}
              onPress={() => router.push({ pathname: '/(tabs)/suivi', params: { missionId: missionActive.id } })}
              activeOpacity={0.88}
            >
              <View style={s.missionActivePulse}>
                <View style={s.missionActiveDot} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.missionActiveTitle}>
                  {missionActive.statut === 'TERMINEE' && missionActive.paiements?.[0]?.statut !== 'PAYE'
                    ? 'Soin terminé — paiement en attente'
                    : STATUT_LABEL[missionActive.statut]?.label ?? 'Mission en cours'
                  }
                </Text>
                <Text style={s.missionActiveSub}>
                  {SPECIALITE_LABEL[missionActive.specialite]}
                  {missionActive.praticien
                    ? ` · ${missionActive.praticien.user.prenom} ${missionActive.praticien.user.nom}`
                    : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.ctaCard} onPress={() => router.push('/(tabs)/demande')} activeOpacity={0.92}>
              <View style={s.ctaLeft}>
                <Text style={s.ctaTitle}>Demander un soin</Text>
                <Text style={s.ctaSub}>Un professionnel chez vous en moins de 30 min</Text>
              </View>
              <View style={s.ctaIconWrap}>
                <Ionicons name="add" size={28} color="#0d5068" />
              </View>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </SafeAreaView>

      <ScrollView
        style={s.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Soins disponibles</Text>
          </View>
          <View style={s.specGrid}>
            {SPECIALITES.map(sp => (
              <TouchableOpacity
                key={sp.key}
                style={s.specCard}
                onPress={() => router.push({ pathname: '/(tabs)/demande', params: { specialite: sp.key } })}
                activeOpacity={0.85}
              >
                <View style={[s.specIconWrap, { backgroundColor: sp.bg }]}>
                  <MaterialCommunityIcons name={sp.icon as never} size={26} color={sp.color} />
                </View>
                <Text style={s.specLabel}>{sp.label}</Text>
                <Text style={s.specPrix}>dès {sp.prix} F</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.trustBanner}>
          {[
            { icon: 'shield-checkmark', label: 'Praticiens vérifiés', color: '#22c55e' },
            { icon: 'time', label: 'Réponse rapide', color: '#0d5068' },
            { icon: 'star', label: 'Soins de qualité', color: '#f59e0b' },
          ].map(t => (
            <View key={t.label} style={s.trustItem}>
              <Ionicons name={t.icon as never} size={18} color={t.color} />
              <Text style={s.trustLabel}>{t.label}</Text>
            </View>
          ))}
        </View>

        {articles.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Derniers Articles santé</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/articles' as never)}>
                <Text style={s.sectionLink}>Voir tout</Text>
              </TouchableOpacity>
            </View>
            {articles.map(art => (
              <TouchableOpacity
                key={art.id}
                style={s.artCard}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/(tabs)/articles/[id]', params: { id: art.id } } as never)}
              >
                {art.imageUrl ? (
                  <Image source={{ uri: art.imageUrl }} style={s.artThumb} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={['#0d5068', '#0a3f52']} style={s.artThumb}>
                    <Ionicons name="newspaper-outline" size={22} color="rgba(255,255,255,0.7)" />
                  </LinearGradient>
                )}
                <View style={s.artInfo}>
                  <View style={s.artCatWrap}>
                    <Text style={s.artCat}>{art.categorie}</Text>
                  </View>
                  <Text style={s.artTitle} numberOfLines={2}>{art.titre}</Text>
                  <Text style={s.artMeta}>{art.auteur}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#d1d0c9" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  safeTop: { backgroundColor: '#0d5068' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '500', marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  notifBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', position: 'absolute', top: 8, right: 8, borderWidth: 1.5, borderColor: '#0d5068' },
  missionActiveCard: {
    backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  missionActivePulse: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  missionActiveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e' },
  missionActiveTitle: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 2 },
  missionActiveSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  ctaCard: { backgroundColor: '#fff', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  ctaLeft: { flex: 1, marginRight: 12 },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: '#0d5068', letterSpacing: -0.3, marginBottom: 4 },
  ctaSub: { fontSize: 12, color: '#888780', lineHeight: 17 },
  ctaIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  scroll: { paddingTop: 4 },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a18', letterSpacing: -0.3 },
  sectionLink: { fontSize: 13, fontWeight: '600', color: '#0d5068' },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specCard: { width: Math.floor((width - 56) / 3), backgroundColor: '#fff', borderRadius: 14, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  specIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  specLabel: { fontSize: 10, fontWeight: '700', color: '#1a1a18', textAlign: 'center', lineHeight: 14 },
  specPrix: { fontSize: 9, color: '#888780', marginTop: 3, fontWeight: '500' },
  trustBanner: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-around', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  trustItem: { alignItems: 'center', gap: 6 },
  trustLabel: { fontSize: 10, fontWeight: '600', color: '#5f5e5a', textAlign: 'center' },
  artCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  artThumb: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  artInfo: { flex: 1 },
  artCatWrap: { backgroundColor: '#e0f2fe', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, marginBottom: 5 },
  artCat: { fontSize: 10, fontWeight: '700', color: '#0d5068' },
  artTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a18', lineHeight: 18, marginBottom: 4 },
  artMeta: { fontSize: 11, color: '#888780', fontWeight: '500' },
})