import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert
} from 'react-native'
import { router } from 'expo-router'
import api from '@/lib/api'
import { saveAuth } from '@/lib/auth'

export default function LoginScreen() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [telephone, setTelephone] = useState('+221')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendOtp() {
    if (telephone.length < 12) {
      Alert.alert('Erreur', 'Numéro de téléphone invalide')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/otp/send', { telephone })
      setStep('otp')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } }
      Alert.alert('Erreur', err?.response?.data?.error || 'Numéro introuvable')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      Alert.alert('Erreur', 'Le code doit contenir 6 chiffres')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/otp/verify', { telephone, code: otp })
      await saveAuth(data.user, data.accessToken, data.refreshToken)
      if (data.user.role === 'PATIENT') {
        router.replace('/(tabs)')
      } else if (data.user.role === 'PRATICIEN') {
        router.replace('/(tabs)')
      }
    } catch {
      Alert.alert('Erreur', 'Code invalide ou expiré')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.logo}>
              <Text style={s.logoW}>W</Text>
              <Text style={s.logoAluma}>aluma</Text>
            </View>
            <Text style={s.tagline}>Soins à domicile · Dakar</Text>
          </View>

          {/* Form */}
          <View style={s.card}>
            {step === 'phone' ? (
              <>
                <Text style={s.label}>Numéro de téléphone</Text>
                <TextInput
                  style={s.input}
                  value={telephone}
                  onChangeText={setTelephone}
                  placeholder="+221 77 000 00 00"
                  keyboardType="phone-pad"
                  autoFocus
                />
                <Text style={s.hint}>Vous recevrez un code de confirmation</Text>
                <TouchableOpacity
                  style={[s.btn, loading && s.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.btnText}>Recevoir le code</Text>
                  }
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.label}>Code de confirmation</Text>
                <Text style={s.subLabel}>Envoyé au {telephone}</Text>
                <TextInput
                  style={[s.input, s.inputOtp]}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
                <TouchableOpacity
                  style={[s.btn, s.btnGreen, loading && s.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.btnText}>Se connecter</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.linkBtn}
                  onPress={() => { setStep('phone'); setOtp('') }}
                >
                  <Text style={s.linkText}>Modifier le numéro</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Privacy */}
          <Text style={s.privacy}>
            En vous connectant, vous acceptez nos{' '}
            <Text style={s.privacyLink}>conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text style={s.privacyLink}>politique de confidentialité</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d5068' },
  flex: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  logoW: { fontSize: 38, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  logoAluma: { fontSize: 38, fontWeight: '800', color: '#4ade80', letterSpacing: -1 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  label: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 6 },
  subLabel: { fontSize: 12, color: '#888780', marginBottom: 12, marginTop: -4 },
  hint: { fontSize: 12, color: '#888780', marginBottom: 14 },
  input: {
    borderWidth: 1, borderColor: '#e5e4df', borderRadius: 12,
    padding: 14, fontSize: 16, color: '#1a1a18', marginBottom: 8,
  },
  inputOtp: {
    fontSize: 24, fontWeight: '700', textAlign: 'center', letterSpacing: 8,
  },
  btn: {
    backgroundColor: '#0d5068', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  btnGreen: { backgroundColor: '#22c55e' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  linkBtn: { alignItems: 'center', marginTop: 12 },
  linkText: { fontSize: 13, color: '#888780', fontWeight: '600' },
  privacy: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 24, lineHeight: 17 },
  privacyLink: { color: 'rgba(255,255,255,0.7)', textDecorationLine: 'underline' },
})