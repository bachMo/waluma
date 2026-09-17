import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, Dimensions
} from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import api from '@/lib/api'
import { saveAuth } from '@/lib/auth'

const { height } = Dimensions.get('window')

export default function LoginScreen() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [telephone, setTelephone] = useState('+221')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendOtp() {
    if (telephone.replace(/\s/g, '').length < 12) {
      Alert.alert('Numéro invalide', 'Entrez un numéro sénégalais valide')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/otp/send', { telephone: telephone.replace(/\s/g, '') })
      setStep('otp')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; nouveauCompte?: boolean } } }
      if (err?.response?.data?.nouveauCompte) {
        Alert.alert(
          'Compte introuvable',
          'Ce numéro n\'a pas de compte Waluma. Souhaitez-vous en créer un ?',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Créer un compte', onPress: () => router.push({ pathname: '/(auth)/register', params: { telephone: telephone.replace(/\s/g, '') } } as never) },
          ]
        )
      } else {
        Alert.alert('Erreur', err?.response?.data?.error || 'Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      Alert.alert('Code invalide', 'Le code doit contenir 6 chiffres')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/otp/verify', {
        telephone: telephone.replace(/\s/g, ''), code: otp
      })
      await saveAuth(data.user, data.accessToken, data.refreshToken)
      if (data.user.role === 'PATIENT') {
        router.replace('/(tabs)' as never)
      } else if (data.user.role === 'PRATICIEN') {
        router.replace('/(praticien)' as never)
      }
    } catch {
      Alert.alert('Code incorrect', 'Le code est invalide ou expiré. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50', '#061e28']} style={s.bg}>
        <View style={[s.circle, s.circle1]} />
        <View style={[s.circle, s.circle2]} />
        <View style={[s.circle, s.circle3]} />

        <KeyboardAvoidingView style={s.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.logoWrap}>
            <View style={s.logoIcon}>
              <Ionicons name="heart-circle" size={40} color="#22c55e" />
            </View>
            <Text style={s.logoText}>
              <Text style={s.logoW}>W</Text>
              <Text style={s.logoAluma}>aluma</Text>
            </Text>
            <Text style={s.logoSub}>Soins à domicile · Dakar</Text>
          </View>

          <View style={s.card}>
            {step === 'phone' ? (
              <>
                <Text style={s.cardTitle}>Connexion</Text>
                <Text style={s.cardSub}>Entrez votre numéro pour recevoir un code</Text>

                <View style={s.inputWrap}>
                  <View style={s.inputFlag}>
                    <Text style={s.flagText}>🇸🇳</Text>
                  </View>
                  <TextInput
                    style={s.input}
                    value={telephone}
                    onChangeText={setTelephone}
                    placeholder="77 000 00 00"
                    keyboardType="phone-pad"
                    autoFocus
                    placeholderTextColor="#b4b2a9"
                  />
                </View>

                <TouchableOpacity
                  style={[s.btn, loading && s.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <>
                      <Text style={s.btnText}>Recevoir le code</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </>
                  }
                </TouchableOpacity>

                {/* Lien inscription */}
                <TouchableOpacity
                  style={s.switchLink}
                  onPress={() => router.push('/(auth)/register' as never)}
                >
                  <Text style={s.switchText}>Pas encore de compte ? </Text>
                  <Text style={s.switchTextBold}>S'inscrire</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => { setStep('phone'); setOtp('') }} style={s.backRow}>
                  <Ionicons name="chevron-back" size={18} color="#5f5e5a" />
                  <Text style={s.backText}>Modifier le numéro</Text>
                </TouchableOpacity>

                <Text style={s.cardTitle}>Code de confirmation</Text>
                <Text style={s.cardSub}>
                  Code envoyé au <Text style={{ fontWeight: '700', color: '#0d5068' }}>{telephone}</Text>
                </Text>

                <TextInput
                  style={s.otpInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="· · · · · ·"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  placeholderTextColor="#d1d0c9"
                />

                <TouchableOpacity
                  style={[s.btn, s.btnGreen, loading && s.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={s.btnText}>Se connecter</Text>
                    </>
                  }
                </TouchableOpacity>

                <TouchableOpacity style={s.resendBtn} onPress={handleSendOtp}>
                  <Text style={s.resendText}>Renvoyer le code</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={s.privacy}>
            En vous connectant, vous acceptez nos{' '}
            <Text style={s.privacyLink}>CGU</Text>
            {' '}et notre{' '}
            <Text style={s.privacyLink}>politique de confidentialité</Text>
          </Text>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1 },
  circle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.04)' },
  circle1: { width: 300, height: 300, top: -80, right: -80 },
  circle2: { width: 200, height: 200, top: height * 0.25, left: -60 },
  circle3: { width: 150, height: 150, bottom: 100, right: -30 },
  kav: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { marginBottom: 12 },
  logoText: { flexDirection: 'row', marginBottom: 6 },
  logoW: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  logoAluma: { fontSize: 36, fontWeight: '800', color: '#4ade80', letterSpacing: -1 },
  logoSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.25, shadowRadius: 40, elevation: 16 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a18', letterSpacing: -0.5, marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#888780', lineHeight: 18, marginBottom: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e4df', borderRadius: 14, overflow: 'hidden', marginBottom: 14 },
  inputFlag: { paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#f5f4ef', borderRightWidth: 1, borderRightColor: '#e5e4df' },
  flagText: { fontSize: 20 },
  input: { flex: 1, paddingHorizontal: 14, fontSize: 17, color: '#1a1a18', fontWeight: '600' },
  btn: { backgroundColor: '#0d5068', borderRadius: 14, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnGreen: { backgroundColor: '#22c55e' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  backText: { fontSize: 13, color: '#5f5e5a', fontWeight: '600' },
  otpInput: { fontSize: 32, fontWeight: '800', textAlign: 'center', letterSpacing: 10, color: '#1a1a18', borderWidth: 1.5, borderColor: '#e5e4df', borderRadius: 14, padding: 16, marginBottom: 14 },
  resendBtn: { alignItems: 'center', marginTop: 12 },
  resendText: { fontSize: 13, color: '#0d5068', fontWeight: '600' },
  switchLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: '#e5e4df' },
  switchText: { fontSize: 13, color: '#888780' },
  switchTextBold: { fontSize: 13, fontWeight: '700', color: '#0d5068' },
  privacy: { fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 20, lineHeight: 17 },
  privacyLink: { color: 'rgba(255,255,255,0.6)', textDecorationLine: 'underline' },
})