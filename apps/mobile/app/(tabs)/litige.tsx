import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput, Alert,
  ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

const MOTIFS = [
  { key: 'PRATICIEN_ABSENT', label: 'Le praticien ne s\'est pas présenté', icon: 'person-remove-outline' },
  { key: 'SOIN_INCOMPLET', label: 'Soin incomplet ou mal effectué', icon: 'medical-outline' },
  { key: 'COMPORTEMENT', label: 'Comportement inapproprié', icon: 'warning-outline' },
  { key: 'PAIEMENT', label: 'Problème de paiement', icon: 'card-outline' },
  { key: 'AUTRE', label: 'Autre motif', icon: 'ellipsis-horizontal-outline' },
]

export default function LitigeScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>()
  const [motif, setMotif] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!motif) {
      Alert.alert('Motif requis', 'Choisissez un motif pour votre litige')
      return
    }
    if (description.trim().length < 20) {
      Alert.alert('Description trop courte', 'Décrivez votre problème en au moins 20 caractères')
      return
    }

    Alert.alert(
      'Confirmer le litige',
      'Votre litige sera transmis à notre équipe qui vous contactera dans les 24h.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Soumettre',
          onPress: async () => {
            setLoading(true)
            try {
              await api.post('/litiges', {
                missionId,
                motif: MOTIFS.find(m => m.key === motif)?.label || motif,
                description,
              })
              Alert.alert(
                '✓ Litige soumis',
                'Notre équipe a été notifiée et vous contactera dans les 24h.',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)' as never) }]
              )
            } catch (e: unknown) {
              const err = e as { response?: { data?: { error?: string } } }
              Alert.alert('Erreur', err?.response?.data?.error || 'Impossible de soumettre le litige')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#dc2626', '#991b1b']} style={s.headerGrad}>
        <SafeAreaView>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Signaler un problème</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.infoCard}>
            <Ionicons name="shield-checkmark" size={18} color="#dc2626" />
            <Text style={s.infoText}>
              Notre équipe traitera votre signalement dans les 24 heures. Soyez précis dans votre description pour accélérer la résolution.
            </Text>
          </View>

          {/* Motif */}
          <View style={s.section}>
            <Text style={s.label}>Motif du litige <Text style={s.required}>*</Text></Text>
            {MOTIFS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[s.motifCard, motif === m.key && s.motifCardActive]}
                onPress={() => setMotif(m.key)}
                activeOpacity={0.85}
              >
                <View style={[s.motifIcon, motif === m.key && s.motifIconActive]}>
                  <Ionicons name={m.icon as never} size={18} color={motif === m.key ? '#dc2626' : '#888780'} />
                </View>
                <Text style={[s.motifLabel, motif === m.key && s.motifLabelActive]}>{m.label}</Text>
                {motif === m.key && <Ionicons name="checkmark-circle" size={18} color="#dc2626" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <View style={s.section}>
            <Text style={s.label}>Description <Text style={s.required}>*</Text></Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez précisément ce qui s'est passé, les dates et heures, les éléments de preuve..."
              placeholderTextColor="#b4b2a9"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={[s.charCount, description.length < 20 && { color: '#dc2626' }]}>
              {description.length} caractères {description.length < 20 ? `(minimum 20)` : '✓'}
            </Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.submitBtn, (!motif || description.length < 20 || loading) && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!motif || description.length < 20 || loading}
            activeOpacity={0.88}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                <Ionicons name="flag" size={18} color="#fff" />
                <Text style={s.submitText}>Soumettre le litige</Text>
              </>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  headerGrad: {},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  body: { flex: 1 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#fee2e2', margin: 16, borderRadius: 14, padding: 14,
    borderWidth: 0.5, borderColor: 'rgba(220,38,38,0.2)',
  },
  infoText: { flex: 1, fontSize: 12, color: '#991b1b', lineHeight: 18 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#1a1a18', marginBottom: 10 },
  required: { color: '#dc2626' },
  motifCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  motifCardActive: { borderColor: '#dc2626', backgroundColor: '#fff5f5' },
  motifIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#f5f4ef', alignItems: 'center', justifyContent: 'center',
  },
  motifIconActive: { backgroundColor: '#fee2e2' },
  motifLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1a1a18' },
  motifLabelActive: { fontWeight: '600', color: '#dc2626' },
  input: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    fontSize: 14, color: '#1a1a18', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)',
  },
  textarea: { minHeight: 140, lineHeight: 21 },
  charCount: { fontSize: 11, color: '#b4b2a9', marginTop: 6, textAlign: 'right' },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)' },
  submitBtn: {
    backgroundColor: '#dc2626', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})