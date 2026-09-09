import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

const TYPES: Record<string, { label: string; icon: string; description: string }> = {
  SPECIALITE: {
    label: 'Nouvelle spécialité',
    icon: 'medical-outline',
    description: 'Demander l\'ajout d\'une nouvelle spécialité à votre profil',
  },
  ZONE: {
    label: 'Zone d\'intervention',
    icon: 'location-outline',
    description: 'Demander une modification de votre zone d\'intervention',
  },
  AUTRE: {
    label: 'Autre demande',
    icon: 'help-circle-outline',
    description: 'Toute autre demande concernant votre compte',
  },
}

export default function DemandeScreen() {
  const params = useLocalSearchParams<{ type: string }>()
  const [type, setType] = useState(params.type || 'SPECIALITE')
  const [description, setDescription] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (description.trim().length < 20) {
      Alert.alert('Description trop courte', 'Décrivez votre demande en au moins 20 caractères')
      return
    }

    Alert.alert(
      'Confirmer la demande',
      'Votre demande sera transmise à l\'équipe Waluma. Nous vous répondrons dans les 48h.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: async () => {
            setLoading(true)
            try {
              await api.post('/demandes', { type, description: description.trim(), details: details.trim() })
              Alert.alert(
                '✓ Demande envoyée',
                'L\'équipe Waluma a été notifiée. Vous recevrez une réponse dans les 48h.',
                [{ text: 'OK', onPress: () => router.replace('/praticien-compte/mes-demandes' as never) }]
              )
            } catch {
              Alert.alert('Erreur', 'Impossible d\'envoyer la demande. Réessayez.')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  const selectedType = TYPES[type] ?? TYPES.SPECIALITE

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Nouvelle demande</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.infoCard}>
            <Ionicons name="information-circle" size={18} color="#0d5068" />
            <Text style={s.infoText}>
              L'équipe Waluma traitera votre demande dans les 48h ouvrées et vous notifiera par l'application.
            </Text>
          </View>

          {/* Type de demande */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Type de demande</Text>
            {Object.entries(TYPES).map(([key, val]) => (
              <TouchableOpacity
                key={key}
                style={[s.typeCard, type === key && s.typeCardActive]}
                onPress={() => setType(key)}
                activeOpacity={0.85}
              >
                <View style={[s.typeIcon, type === key && s.typeIconActive]}>
                  <Ionicons name={val.icon as never} size={20} color={type === key ? '#0d5068' : '#888780'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.typeLabel, type === key && s.typeLabelActive]}>{val.label}</Text>
                  <Text style={s.typeDesc}>{val.description}</Text>
                </View>
                {type === key && <Ionicons name="checkmark-circle" size={20} color="#0d5068" />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Description de votre demande <Text style={s.required}>*</Text></Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder={`Décrivez précisément votre demande de ${selectedType.label.toLowerCase()}...`}
              placeholderTextColor="#b4b2a9"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={[s.charCount, description.length < 20 && description.length > 0 && { color: '#dc2626' }]}>
              {description.length}/20 caractères minimum
            </Text>
          </View>

          {/* Détails supplémentaires */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Informations complémentaires <Text style={s.optional}>(optionnel)</Text></Text>
            <TextInput
              style={[s.input, s.textareaSm]}
              value={details}
              onChangeText={setDetails}
              placeholder="Diplômes, certifications, justificatifs à fournir..."
              placeholderTextColor="#b4b2a9"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.submitBtn, (description.length < 20 || loading) && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={description.length < 20 || loading}
            activeOpacity={0.88}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                <Ionicons name="send-outline" size={18} color="#fff" />
                <Text style={s.submitText}>Envoyer la demande</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  body: { flex: 1 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#e0f2fe', margin: 16, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: 'rgba(13,80,104,0.2)' },
  infoText: { flex: 1, fontSize: 12, color: '#0d5068', lineHeight: 18 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a18', marginBottom: 10 },
  required: { color: '#dc2626' },
  optional: { fontSize: 11, color: '#888780', fontWeight: '500' },
  typeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  typeCardActive: { borderColor: '#0d5068', backgroundColor: '#f0f9ff' },
  typeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f5f4ef', alignItems: 'center', justifyContent: 'center' },
  typeIconActive: { backgroundColor: '#e0f2fe' },
  typeLabel: { fontSize: 14, fontWeight: '700', color: '#5f5e5a', marginBottom: 2 },
  typeLabelActive: { color: '#0d5068' },
  typeDesc: { fontSize: 12, color: '#b4b2a9', lineHeight: 16 },
  input: { backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 14, color: '#1a1a18', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.1)' },
  textarea: { minHeight: 120, lineHeight: 21 },
  textareaSm: { minHeight: 80, lineHeight: 21 },
  charCount: { fontSize: 11, color: '#b4b2a9', marginTop: 6, textAlign: 'right' },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)' },
  submitBtn: { backgroundColor: '#0d5068', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})