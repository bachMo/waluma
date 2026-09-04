import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView
} from 'react-native'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { getUser } from '@/lib/auth'
import api from '@/lib/api'

const SPECIALITES = [
  { key: 'INFIRMIER', label: 'Soins infirmiers', prix: '8 000', emoji: '💉', color: '#22c55e' },
  { key: 'MEDECIN_GENERALISTE', label: 'Médecin généraliste', prix: '15 000', emoji: '🩺', color: '#0d5068' },
  { key: 'PRELEVEUR', label: 'Prélèvement', prix: '5 000', emoji: '🧪', color: '#7c3aed' },
  { key: 'KINESITHERAPEUTE', label: 'Kinésithérapie', prix: '12 000', emoji: '💆', color: '#d97706' },
]

interface Article {
  id: string
  titre: string
  categorie: string
  auteur: string
}

export default function HomeScreen() {
  const [userName, setUserName] = useState('')
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    async function load() {
      const user = await getUser()
      if (user) setUserName(user.prenom)
      else router.replace('/(auth)')

      try {
        const { data } = await api.get('/articles?limit=3&statut=publié')
        setArticles(data.articles)
      } catch {}
    }
    load()
  }, [])

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerSub}>Bonjour</Text>
          <Text style={s.headerName}>{userName || '...'}</Text>
        </View>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{userName?.[0] || '?'}</Text>
        </View>
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        {/* CTA principal */}
        <TouchableOpacity
          style={s.mainCta}
          onPress={() => router.push('/(tabs)/demande')}
        >
          <Text style={s.mainCtaText}>+ Demander un soin</Text>
        </TouchableOpacity>

        {/* Grille spécialités */}
        <Text style={s.sectionTitle}>Soins rapides</Text>
        <View style={s.grid}>
          {SPECIALITES.map(sp => (
            <TouchableOpacity
              key={sp.key}
              style={s.specCard}
              onPress={() => router.push({ pathname: '/(tabs)/demande', params: { specialite: sp.key } })}
            >
              <Text style={s.specEmoji}>{sp.emoji}</Text>
              <Text style={s.specLabel}>{sp.label}</Text>
              <Text style={s.specPrix}>dès {sp.prix} FCFA</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Articles */}
        {articles.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Articles santé</Text>
            {articles.map(art => (
              <TouchableOpacity
                key={art.id}
                style={s.artCard}
                onPress={() => router.push({ pathname: '/articles/[id]', params: { id: art.id } })}
              >
                <View style={s.artThumb}>
                  <Text style={{ fontSize: 24 }}>📰</Text>
                </View>
                <View style={s.artInfo}>
                  <Text style={s.artCat}>{art.categorie}</Text>
                  <Text style={s.artTitle} numberOfLines={2}>{art.titre}</Text>
                  <Text style={s.artMeta}>{art.auteur}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f4ef' },
  header: {
    backgroundColor: '#0d5068', padding: 16, paddingTop: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  headerName: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  body: { flex: 1 },
  mainCta: {
    backgroundColor: '#22c55e', margin: 16, borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  mainCtaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#888780',
    marginHorizontal: 16, marginTop: 14, marginBottom: 10,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 8,
  },
  specCard: {
    width: '48%', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  specEmoji: { fontSize: 24, marginBottom: 6 },
  specLabel: { fontSize: 13, fontWeight: '600', color: '#1a1a18', textAlign: 'center' },
  specPrix: { fontSize: 11, color: '#888780', marginTop: 3 },
  artCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, padding: 12, flexDirection: 'row',
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  artThumb: {
    width: 60, height: 60, borderRadius: 12,
    backgroundColor: '#f1f0eb', alignItems: 'center', justifyContent: 'center',
    marginRight: 12, flexShrink: 0,
  },
  artInfo: { flex: 1 },
  artCat: {
    fontSize: 11, fontWeight: '700', color: '#0d5068',
    backgroundColor: '#e0f2fe', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 100, alignSelf: 'flex-start', marginBottom: 4,
  },
  artTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a18', lineHeight: 19, marginBottom: 4 },
  artMeta: { fontSize: 11, color: '#888780' },
})