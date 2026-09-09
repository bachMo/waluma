import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Share, Image, StatusBar
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import api from '@/lib/api'

interface Article {
  id: string
  titre: string
  contenu: string
  categorie: string
  auteur: string
  vues: number
  imageUrl: string | null
  createdAt: string
}

const CAT_COLORS: Record<string, string> = {
  Prévention: '#0d5068', Nutrition: '#16a34a', Maternité: '#db2777',
  Enfants: '#7c3aed', Chroniques: '#d97706', Conseils: '#0891b2', 'Bien-être': '#059669',
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/articles/${id}`)
        setArticle(data)
      } catch { router.back() } finally { setLoading(false) }
    }
    load()
  }, [id])

  async function handleShare() {
    if (!article) return
    await Share.share({ title: article.titre, message: `${article.titre}\n\nLu sur Waluma - Soins à domicile` })
  }

  if (loading) {
    return <View style={s.center}><ActivityIndicator color="#0d5068" size="large" /></View>
  }

  if (!article) return null

  const catColor = CAT_COLORS[article.categorie] ?? '#0d5068'

  const NavButtons = () => (
    <View style={[s.headerNav, { paddingTop: insets.top + 12 }]}>
      <TouchableOpacity onPress={() => router.back()} style={s.navBtn}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleShare} style={s.navBtn}>
        <Ionicons name="share-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  )

  const HeaderContent = () => (
    <View style={s.headerContent}>
      <View style={[s.catBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
        <Text style={s.catText}>{article.categorie}</Text>
      </View>
      <Text style={s.titre}>{article.titre}</Text>
    </View>
  )

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {article.imageUrl ? (
        <View style={s.headerImg}>
          <Image source={{ uri: article.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
          <NavButtons />
          <HeaderContent />
        </View>
      ) : (
        <LinearGradient colors={[catColor, '#083d50']} style={s.headerImg}>
          <NavButtons />
          <HeaderContent />
        </LinearGradient>
      )}

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* Meta */}
        <View style={s.metaCard}>
          <View style={s.authorRow}>
            <View style={[s.authorAvatar, { backgroundColor: catColor + '20' }]}>
              <Ionicons name="person" size={16} color={catColor} />
            </View>
            <View>
              <Text style={s.authorName}>{article.auteur}</Text>
              <Text style={s.authorRole}>Professionnel de santé</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Ionicons name="calendar-outline" size={14} color="#b4b2a9" />
              <Text style={s.statText}>
                {new Date(article.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Text>
            </View>
            <View style={s.stat}>
              <Ionicons name="eye-outline" size={14} color="#b4b2a9" />
              <Text style={s.statText}>{article.vues.toLocaleString()} vues</Text>
            </View>
          </View>
        </View>

        {/* Contenu */}
        <View style={s.contenu}>
          {article.contenu.split('\n').filter(p => p.trim()).map((para, i) => (
            <Text key={i} style={s.para}>{para}</Text>
          ))}
        </View>

        {/* CTA */}
        <View style={s.ctaCard}>
          <View style={s.ctaInfo}>
            <Text style={s.ctaTitle}>Besoin d'un soin ?</Text>
            <Text style={s.ctaSub}>Un professionnel chez vous en moins de 30 min</Text>
          </View>
          <TouchableOpacity style={s.ctaBtn} onPress={() => router.push('/(tabs)/demande' as never)}>
            <Text style={s.ctaBtnText}>Demander</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerImg: { paddingBottom: 24, position: 'relative' },
  headerNav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  navBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  headerContent: { paddingHorizontal: 20 },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, marginBottom: 12 },
  catText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  titre: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 30, letterSpacing: -0.3 },
  body: { flex: 1 },
  metaCard: { backgroundColor: '#fff', margin: 16, borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  authorAvatar: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 2 },
  authorRole: { fontSize: 12, color: '#888780' },
  statsRow: { flexDirection: 'row', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statText: { fontSize: 12, color: '#b4b2a9', fontWeight: '500' },
  contenu: { paddingHorizontal: 20, paddingBottom: 8 },
  para: { fontSize: 15, color: '#3a3a38', lineHeight: 26, marginBottom: 14, fontWeight: '400' },
  ctaCard: { backgroundColor: '#0d5068', marginHorizontal: 16, marginBottom: 8, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctaInfo: { flex: 1 },
  ctaTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 3 },
  ctaSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  ctaBtn: { backgroundColor: '#22c55e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  ctaBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
})