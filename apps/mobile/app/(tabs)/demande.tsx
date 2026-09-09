import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import api from '@/lib/api'
import { useEffect } from 'react'

const SPECIALITES = [
  { key: 'INFIRMIER', label: 'Soins infirmiers', prix: 8000, emoji: '💉' },
  { key: 'MEDECIN_GENERALISTE', label: 'Médecin généraliste', prix: 15000, emoji: '🩺' },
  { key: 'PRELEVEUR', label: 'Prélèvement', prix: 5000, emoji: '🧪' },
  { key: 'KINESITHERAPEUTE', label: 'Kinésithérapie', prix: 12000, emoji: '💆' },
  { key: 'SAGE_FEMME', label: 'Sage-femme', prix: 12000, emoji: '👶' },
  { key: 'PEDIATRE', label: 'Pédiatre', prix: 15000, emoji: '🧒' },
]

export default function DemandeScreen() {
  const params = useLocalSearchParams()
  const [specialite, setSpecialite] = useState<string>(params.specialite as string || '')
  const [adresse, setAdresse] = useState('')
  const [note, setNote] = useState('')
  const [urgence, setUrgence] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
  if (params.specialite) {
    setSpecialite(params.specialite as string)
  }
}, [params.specialite])

  const selected = SPECIALITES.find(s => s.key === specialite)
  const montantTotal = selected ? selected.prix + 2500 : 0

  async function handleSubmit() {
    if (!specialite) {
      Alert.alert('Erreur', 'Choisissez une spécialité')
      return
    }
    if (!adresse.trim()) {
      Alert.alert('Erreur', 'Entrez votre adresse')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/missions', {
        specialite,
        adresseTexte: adresse,
        notePatient: note,
        urgence,
        type: 'IMMEDIATE',
        montantBase: selected?.prix || 8000,
        fraisDeplacement: 2500,
      })
      router.push({ pathname: '/(tabs)/suivi', params: { missionId: data.id } })
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      Alert.alert('Erreur', err?.response?.data?.error || 'Erreur lors de la demande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Demander un soin</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* Spécialité */}
        <Text style={s.sectionTitle}>Type de soin</Text>
        <View style={s.grid}>
          {SPECIALITES.map(sp => (
            <TouchableOpacity
              key={sp.key}
              style={[s.specCard, specialite === sp.key && s.specCardActive]}
              onPress={() => setSpecialite(sp.key)}
            >
              <Text style={s.specEmoji}>{sp.emoji}</Text>
              <Text style={[s.specLabel, specialite === sp.key && s.specLabelActive]}>
                {sp.label}
              </Text>
              <Text style={s.specPrix}>{sp.prix.toLocaleString()} FCFA</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Adresse */}
        <Text style={s.sectionTitle}>Votre adresse</Text>
        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            value={adresse}
            onChangeText={setAdresse}
            placeholder="Ex : Villa 12, Almadies, Dakar"
            multiline
          />
        </View>

        {/* Note pour le praticien */}
        <Text style={s.sectionTitle}>Note pour le praticien (optionnel)</Text>
        <View style={s.inputWrap}>
          <TextInput
            style={[s.input, { minHeight: 80 }]}
            value={note}
            onChangeText={setNote}
            placeholder="Ex : Apporter du matériel de perfusion, porte code 1234..."
            multiline
          />
        </View>

        {/* Urgence */}
        <View style={s.inputWrap}>
          <TouchableOpacity
            style={[s.urgenceRow, urgence && s.urgenceRowActive]}
            onPress={() => setUrgence(!urgence)}
          >
            <View style={[s.urgenceCheck, urgence && s.urgenceCheckActive]}>
              {urgence && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.urgenceLabel}>Mission urgente</Text>
              <Text style={s.urgenceSub}>Le praticien disponible le plus proche sera prioritaire</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Récapitulatif */}
        {selected && (
          <View style={s.recap}>
            <Text style={s.recapTitle}>Récapitulatif</Text>
            <View style={s.recapRow}>
              <Text style={s.recapLabel}>{selected.label}</Text>
              <Text style={s.recapVal}>{selected.prix.toLocaleString()} F</Text>
            </View>
            <View style={s.recapRow}>
              <Text style={s.recapLabel}>Frais de déplacement</Text>
              <Text style={s.recapVal}>2 500 F</Text>
            </View>
            <View style={[s.recapRow, s.recapTotal]}>
              <Text style={s.recapTotalLabel}>Total</Text>
              <Text style={s.recapTotalVal}>{montantTotal.toLocaleString()} FCFA</Text>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bouton confirmer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.submitBtn, (!specialite || !adresse || loading) && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!specialite || !adresse || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.submitText}>Confirmer la demande</Text>
          }
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
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  body: { flex: 1 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#888780',
    marginHorizontal: 16, marginTop: 16, marginBottom: 10,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  specCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  specCardActive: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  specEmoji: { fontSize: 24, marginBottom: 6 },
  specLabel: { fontSize: 12, fontWeight: '600', color: '#1a1a18', textAlign: 'center' },
  specLabelActive: { color: '#15803d' },
  specPrix: { fontSize: 11, color: '#888780', marginTop: 3 },
  inputWrap: { marginHorizontal: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 14, color: '#1a1a18',
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)',
  },
  urgenceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)',
  },
  urgenceRowActive: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  urgenceCheck: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  urgenceCheckActive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  urgenceLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a18' },
  urgenceSub: { fontSize: 11, color: '#888780', marginTop: 2 },
  recap: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8,
    borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)',
  },
  recapTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a18', marginBottom: 12 },
  recapRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  recapLabel: { fontSize: 13, color: '#5f5e5a' },
  recapVal: { fontSize: 13, color: '#1a1a18' },
  recapTotal: { borderBottomWidth: 0, paddingTop: 10, marginTop: 2 },
  recapTotalLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a18' },
  recapTotalVal: { fontSize: 14, fontWeight: '700', color: '#22c55e' },
  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)',
  },
  submitBtn: {
    backgroundColor: '#22c55e', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})