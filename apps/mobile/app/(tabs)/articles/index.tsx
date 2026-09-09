import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, TextInput, ActivityIndicator,
  RefreshControl, Image
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Article {
  id: string
  titre: string
  categorie: string
  auteur: string
  vues: number
  imageUrl: string | null
  createdAt: string
}

const CATEGORIES = ['Tout', 'Prévention', 'Nutrition', 'Maternité', 'Enfants', 'Chroniques', 'Conseils', 'Bien-être']

const CAT_COLORS: Record<string, string> = {
  Prévention: '#0d5068', Nutrition: '#16a34a', Maternité: '#db2777',
  Enfants: '#7c3aed', Chroniques: '#d97706', Conseils: '#0891b2', 'Bien-être': '#059669',
}

export default function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [categorie, setCategorie] = useState('Tout')

  async function load() {
    try {
      const params = new URLSearchParams({ limit: '50', statut: 'publié' })
      if (categorie !== 'Tout') params.append('categorie', categorie)
      const { data } = await api.get(`/articles?${params}`)
      setArticles(data.articles)
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [categorie])
  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [categorie])

  const filtered = articles.filter(a =>
    a.titre.toLowerCase().includes(search.toLowerCase()) ||
    a.auteur.toLowerCase().includes(search.toLowerCase())
  )

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Articles santé</Text>
          <Text style={s.headerSub}>{filtered.length} article{filtered.length > 1 ? 's' : ''}</Text>
        </View>
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={18} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={s.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un article..."
            placeholderTextColor="rgba(255,255,255,0.35)"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={s.catsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cats}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[s.catChip, categorie === cat && s.catChipActive]}
              onPress={() => setCategorie(cat)}
            >
              <Text style={[s.catText, categorie === cat && s.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color="#0d5068" size="large" />
        </View>
      ) : (
        <ScrollView
          style={s.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
        >
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="newspaper-outline" size={48} color="#d1d0c9" />
              <Text style={s.emptyTitle}>Aucun article trouvé</Text>
            </View>
          ) : (
            <View style={s.list}>
              {/* Article featured */}
              <TouchableOpacity
                style={s.featuredCard}
                onPress={() => router.push({ pathname: '/(tabs)/articles/[id]', params: { id: filtered[0].id } })}
                activeOpacity={0.88}
              >
                {filtered[0].imageUrl ? (
                  <Image source={{ uri: filtered[0].imageUrl }} style={s.featuredThumb} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={['#0d5068', '#083d50']} style={s.featuredThumb}>
                    <Ionicons name="newspaper-outline" size={36} color="rgba(255,255,255,0.4)" />
                  </LinearGradient>
                )}
                <View style={s.featuredInfo}>
                  <View style={[s.catBadge, { backgroundColor: (CAT_COLORS[filtered[0].categorie] ?? '#0d5068') + '20' }]}>
                    <Text style={[s.catBadgeText, { color: CAT_COLORS[filtered[0].categorie] ?? '#0d5068' }]}>
                      {filtered[0].categorie}
                    </Text>
                  </View>
                  <Text style={s.featuredTitle} numberOfLines={3}>{filtered[0].titre}</Text>
                  <View style={s.featuredMeta}>
                    <Text style={s.featuredAuteur}>{filtered[0].auteur}</Text>
                    <View style={s.dot} />
                    <Text style={s.featuredDate}>{formatDate(filtered[0].createdAt)}</Text>
                  </View>
                  <View style={s.viewsRow}>
                    <Ionicons name="eye-outline" size={12} color="#b4b2a9" />
                    <Text style={s.viewsText}>{filtered[0].vues.toLocaleString()} vues</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Reste des articles */}
              {filtered.slice(1).map(art => (
                <TouchableOpacity
                  key={art.id}
                  style={s.artCard}
                  onPress={() => router.push({ pathname: '/(tabs)/articles/[id]', params: { id: art.id } })}
                  activeOpacity={0.85}
                >
                  {art.imageUrl ? (
                    <Image source={{ uri: art.imageUrl }} style={s.artThumb} resizeMode="cover" />
                  ) : (
                    <LinearGradient colors={[CAT_COLORS[art.categorie] ?? '#0d5068', '#083d50']} style={s.artThumb}>
                      <Ionicons name="newspaper-outline" size={20} color="rgba(255,255,255,0.5)" />
                    </LinearGradient>
                  )}
                  <View style={s.artInfo}>
                    <View style={[s.catBadge, { backgroundColor: (CAT_COLORS[art.categorie] ?? '#0d5068') + '15' }]}>
                      <Text style={[s.catBadgeText, { color: CAT_COLORS[art.categorie] ?? '#0d5068' }]}>
                        {art.categorie}
                      </Text>
                    </View>
                    <Text style={s.artTitle} numberOfLines={2}>{art.titre}</Text>
                    <Text style={s.artMeta}>{art.auteur} · {formatDate(art.createdAt)}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#d1d0c9" />
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  headerGrad: { paddingTop: 52 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16, marginBottom: 16, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#fff' },
  catsWrap: { backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  cats: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1, borderColor: '#e5e4df', backgroundColor: '#fff' },
  catChipActive: { backgroundColor: '#0d5068', borderColor: '#0d5068' },
  catText: { fontSize: 12, fontWeight: '600', color: '#5f5e5a' },
  catTextActive: { color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a18' },
  list: { padding: 16, gap: 12 },
  featuredCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  featuredThumb: { height: 180, alignItems: 'center', justifyContent: 'center' },
  featuredInfo: { padding: 16 },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, marginBottom: 8 },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  featuredTitle: { fontSize: 17, fontWeight: '800', color: '#1a1a18', lineHeight: 24, marginBottom: 10 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  featuredAuteur: { fontSize: 12, color: '#5f5e5a', fontWeight: '600' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#d1d0c9' },
  featuredDate: { fontSize: 12, color: '#b4b2a9' },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsText: { fontSize: 11, color: '#b4b2a9' },
  artCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  artThumb: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  artInfo: { flex: 1 },
  artTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a18', lineHeight: 19, marginBottom: 4 },
  artMeta: { fontSize: 11, color: '#b4b2a9', fontWeight: '500' },
})