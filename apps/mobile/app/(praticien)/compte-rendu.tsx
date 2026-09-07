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

interface ConstantesVitales {
  tension: string
  temperature: string
  pouls: string
  spo2: string
}

export default function CompteRenduScreen() {
  const { missionId } = useLocalSearchParams()
  const [loading, setLoading] = useState(false)
  const [acteRealise, setActeRealise] = useState('')
  const [description, setDescription] = useState('')
  const [recommandations, setRecommandations] = useState('')
  const [suiteNecessaire, setSuiteNecessaire] = useState('')
  const [constantes, setConstantes] = useState<ConstantesVitales>({
    tension: '', temperature: '', pouls: '', spo2: '',
  })
  const [showConstantes, setShowConstantes] = useState(false)

  function setC(key: keyof ConstantesVitales, val: string) {
    setConstantes(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    if (!acteRealise.trim()) {
      Alert.alert('Champ requis', 'Décrivez l\'acte réalisé')
      return
    }
    if (!description.trim()) {
      Alert.alert('Champ requis', 'Rédigez le compte rendu de soin')
      return
    }

    Alert.alert(
      'Soumettre le compte rendu',
      'Une fois soumis, la mission sera marquée comme terminée.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Soumettre',
          onPress: async () => {
            setLoading(true)
            try {
              await api.post(`/missions/${missionId}/compte-rendu`, {
                acteRealise,
                description,
                recommandations: recommandations || undefined,
                suiteNecessaire: suiteNecessaire || undefined,
                tension: constantes.tension || undefined,
                temperature: constantes.temperature ? parseFloat(constantes.temperature) : undefined,
                pouls: constantes.pouls ? parseInt(constantes.pouls) : undefined,
                spo2: constantes.spo2 ? parseInt(constantes.spo2) : undefined,
              })
              Alert.alert('✓ Mission terminée', 'Le compte rendu a été enregistré et la mission est clôturée.', [
                { text: 'OK', onPress: () => {
  router.dismissAll()
  router.replace('/(praticien)' as never)
}},
              ])
            } catch {
              Alert.alert('Erreur', 'Impossible de soumettre le compte rendu')
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
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <SafeAreaView>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Compte rendu de soin</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.infoCard}>
            <Ionicons name="information-circle" size={18} color="#0d5068" />
            <Text style={s.infoText}>
              Ce document sera partagé avec le patient et archivé dans son dossier médical.
            </Text>
          </View>

          {/* Acte réalisé */}
          <View style={s.section}>
            <Text style={s.label}>Acte réalisé <Text style={s.required}>*</Text></Text>
            <TextInput
              style={s.input}
              value={acteRealise}
              onChangeText={setActeRealise}
              placeholder="Ex : Injection intraveineuse, pansement, perfusion..."
              placeholderTextColor="#b4b2a9"
            />
          </View>

          {/* Description */}
          <View style={s.section}>
            <Text style={s.label}>Compte rendu détaillé <Text style={s.required}>*</Text></Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrivez le déroulement du soin, l'état général du patient, les observations..."
              placeholderTextColor="#b4b2a9"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Constantes vitales */}
          <View style={s.section}>
            <TouchableOpacity
              style={s.toggleRow}
              onPress={() => setShowConstantes(!showConstantes)}
            >
              <View style={s.toggleLeft}>
                <Ionicons name="pulse" size={18} color="#0d5068" />
                <Text style={s.toggleLabel}>Constantes vitales</Text>
                <Text style={s.toggleOptional}>(optionnel)</Text>
              </View>
              <Ionicons
                name={showConstantes ? 'chevron-up' : 'chevron-down'}
                size={18} color="#888780"
              />
            </TouchableOpacity>

            {showConstantes && (
              <View style={s.constantesGrid}>
                {[
                  { key: 'tension' as const, label: 'Tension artérielle', unit: 'mmHg', placeholder: '120/80' },
                  { key: 'temperature' as const, label: 'Température', unit: '°C', placeholder: '37.2' },
                  { key: 'pouls' as const, label: 'Pouls', unit: 'bpm', placeholder: '72' },
                  { key: 'spo2' as const, label: 'SpO₂', unit: '%', placeholder: '98' },
                ].map(c => (
                  <View key={c.key} style={s.constanteItem}>
                    <Text style={s.constanteLabel}>{c.label}</Text>
                    <View style={s.constanteInputWrap}>
                      <TextInput
                        style={s.constanteInput}
                        value={constantes[c.key]}
                        onChangeText={v => setC(c.key, v)}
                        placeholder={c.placeholder}
                        placeholderTextColor="#d1d0c9"
                        keyboardType="numeric"
                      />
                      <Text style={s.constanteUnit}>{c.unit}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Recommandations */}
          <View style={s.section}>
            <Text style={s.label}>Recommandations <Text style={s.optional}>(optionnel)</Text></Text>
            <TextInput
              style={[s.input, s.textareaSm]}
              value={recommandations}
              onChangeText={setRecommandations}
              placeholder="Conseils post-soin, médicaments à prendre, repos recommandé..."
              placeholderTextColor="#b4b2a9"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Suite nécessaire */}
          <View style={s.section}>
            <Text style={s.label}>Suite nécessaire <Text style={s.optional}>(optionnel)</Text></Text>
            <TextInput
              style={s.input}
              value={suiteNecessaire}
              onChangeText={setSuiteNecessaire}
              placeholder="Ex : Consultation médecin dans 48h, renouveler le pansement..."
              placeholderTextColor="#b4b2a9"
            />
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.submitBtn, (!acteRealise || !description || loading) && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!acteRealise || !description || loading}
            activeOpacity={0.88}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={s.submitText}>Soumettre le compte rendu</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  body: { flex: 1 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#e0f2fe', margin: 16, borderRadius: 14, padding: 14,
    borderWidth: 0.5, borderColor: 'rgba(13,80,104,0.2)',
  },
  infoText: { flex: 1, fontSize: 12, color: '#0d5068', lineHeight: 18 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#1a1a18', marginBottom: 8 },
  required: { color: '#dc2626' },
  optional: { fontSize: 11, color: '#888780', fontWeight: '500' },
  input: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    fontSize: 14, color: '#1a1a18', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)',
  },
  textarea: { minHeight: 120, lineHeight: 21 },
  textareaSm: { minHeight: 80, lineHeight: 21 },
  toggleRow: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)', marginBottom: 8,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a18' },
  toggleOptional: { fontSize: 11, color: '#888780' },
  constantesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  constanteItem: { width: '48%' },
  constanteLabel: { fontSize: 11, fontWeight: '600', color: '#5f5e5a', marginBottom: 6 },
  constanteInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden',
    borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)',
  },
  constanteInput: { flex: 1, padding: 12, fontSize: 15, fontWeight: '600', color: '#1a1a18' },
  constanteUnit: { paddingHorizontal: 10, fontSize: 11, color: '#888780', fontWeight: '600', backgroundColor: '#f5f4ef', paddingVertical: 12 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)' },
  submitBtn: {
    backgroundColor: '#22c55e', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})