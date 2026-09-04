import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Alert, ActivityIndicator
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import api from '@/lib/api'

const TAGS = ['Ponctualité', 'Professionnalisme', 'Écoute', 'Propreté', 'Efficacité']

export default function AvisScreen() {
  const { missionId } = useLocalSearchParams()
  const [note, setNote] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  async function handleSubmit() {
    if (note === 0) {
      Alert.alert('Erreur', 'Veuillez donner une note')
      return
    }
    setLoading(true)
    try {
      await api.post(`/missions/${missionId}/avis`, {
        note, commentaire, tags: selectedTags,
      })
      Alert.alert('Merci !', 'Votre avis a été enregistré.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ])
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'avis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Laisser un avis</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={s.body}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Comment s'est passé votre soin ?</Text>

          {/* Étoiles */}
          <View style={s.stars}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setNote(i)} style={s.star}>
                <Text style={[s.starText, i <= note && s.starOn]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {note > 0 && (
            <Text style={s.noteLabel}>
              {['', 'Très insatisfait', 'Insatisfait', 'Correct', 'Satisfait', 'Très satisfait'][note]}
            </Text>
          )}

          {/* Tags */}
          <Text style={s.tagLabel}>Points positifs</Text>
          <View style={s.tags}>
            {TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[s.tagChip, selectedTags.includes(tag) && s.tagChipOn]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[s.tagText, selectedTags.includes(tag) && s.tagTextOn]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Commentaire */}
          <Text style={s.tagLabel}>Commentaire (optionnel)</Text>
          <TextInput
            style={s.input}
            value={commentaire}
            onChangeText={setCommentaire}
            placeholder="Partagez votre expérience..."
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[s.btn, (note === 0 || loading) && s.btnDisabled]}
          onPress={handleSubmit}
          disabled={note === 0 || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Envoyer l'avis</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={s.skipBtn}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={s.skipText}>Passer cette étape</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f4ef' },
  header: {
    backgroundColor: '#0d5068', padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  body: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)', marginBottom: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a18', textAlign: 'center', marginBottom: 20 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  star: { padding: 4 },
  starText: { fontSize: 36, color: '#e5e4df' },
  starOn: { color: '#f59e0b' },
  noteLabel: { fontSize: 14, fontWeight: '600', color: '#5f5e5a', textAlign: 'center', marginBottom: 20 },
  tagLabel: { fontSize: 13, fontWeight: '600', color: '#1a1a18', marginBottom: 10 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 100, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: '#fff',
  },
  tagChipOn: { backgroundColor: '#f0fdf4', borderColor: '#22c55e' },
  tagText: { fontSize: 13, fontWeight: '600', color: '#5f5e5a' },
  tagTextOn: { color: '#15803d' },
  input: {
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12, padding: 12, fontSize: 14,
    color: '#1a1a18', minHeight: 80, textAlignVertical: 'top',
  },
  btn: {
    backgroundColor: '#22c55e', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  skipBtn: { alignItems: 'center', marginTop: 12 },
  skipText: { fontSize: 13, color: '#888780', fontWeight: '600' },
})