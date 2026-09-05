import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Animated, Easing
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const OPERATEUR_LABEL: Record<string, string> = {
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  FREE_MONEY: 'Free Money',
}

export default function ConfirmationPaiementScreen() {
  const { missionId, montant, operateur } = useLocalSearchParams<{
    missionId: string
    paiementId: string
    montant: string
    operateur: string
  }>()

  const scaleAnim = useRef(new Animated.Value(0)).current
  const opacityAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current

  const reference = `WAL-${Date.now().toString().slice(-8)}`
  const date = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  useEffect(() => {
    // Animation d'entrée
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }, [])

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.bg}>
        <SafeAreaView style={s.safe}>
          <View style={s.container}>

            {/* Icône succès animée */}
            <Animated.View style={[s.successWrap, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient colors={['#22c55e', '#16a34a']} style={s.successCircle}>
                <Ionicons name="checkmark" size={52} color="#fff" />
              </LinearGradient>
              <View style={s.successRing} />
            </Animated.View>

            {/* Texte succès */}
            <Animated.View style={[s.textBlock, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text style={s.successTitle}>Paiement réussi !</Text>
              <Text style={s.successSub}>Votre paiement a été confirmé avec succès</Text>
            </Animated.View>

            {/* Reçu */}
            <Animated.View style={[s.recuCard, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text style={s.recuTitle}>Reçu de paiement</Text>

              {[
                { label: 'Montant payé', value: `${parseInt(montant || '0').toLocaleString()} FCFA`, highlight: true },
                { label: 'Mode de paiement', value: OPERATEUR_LABEL[operateur || 'WAVE'] || operateur },
                { label: 'Référence', value: reference, mono: true },
                { label: 'Date', value: date },
                { label: 'Statut', value: '✓ Confirmé', green: true },
              ].map((item, i) => (
                <View key={i} style={[s.recuRow, i < 4 && s.recuRowBorder]}>
                  <Text style={s.recuLabel}>{item.label}</Text>
                  <Text style={[
                    s.recuVal,
                    item.highlight && s.recuValHighlight,
                    item.mono && s.recuValMono,
                    item.green && s.recuValGreen,
                  ]}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </Animated.View>

            {/* Message praticien */}
            <Animated.View style={[s.praticienNote, { opacity: opacityAnim }]}>
              <Ionicons name="heart" size={16} color="#22c55e" />
              <Text style={s.praticienNoteText}>
                Merci pour votre confiance. Le praticien a été notifié du paiement.
              </Text>
            </Animated.View>

            {/* Actions */}
            <Animated.View style={[s.actions, { opacity: opacityAnim }]}>
              <TouchableOpacity
                style={s.avisBtn}
                onPress={() => router.push({ pathname: '/(tabs)/avis', params: { missionId } })}
                activeOpacity={0.88}
              >
                <Ionicons name="star-outline" size={18} color="#0d5068" />
                <Text style={s.avisBtnText}>Laisser un avis</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={s.homeBtn}
                onPress={() => router.replace('/(tabs)' as never)}
                activeOpacity={0.88}
              >
                <Text style={s.homeBtnText}>Retour à l'accueil</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </Animated.View>

          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  bg: { flex: 1 },
  safe: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  successWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 28, position: 'relative' },
  successCircle: {
    width: 96, height: 96, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  successRing: {
    position: 'absolute', width: 120, height: 120, borderRadius: 40,
    borderWidth: 2, borderColor: 'rgba(34,197,94,0.3)',
  },
  textBlock: { alignItems: 'center', marginBottom: 28 },
  successTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 8 },
  successSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  recuCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    width: '100%', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 12,
  },
  recuTitle: { fontSize: 14, fontWeight: '800', color: '#1a1a18', marginBottom: 16, textAlign: 'center' },
  recuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  recuRowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  recuLabel: { fontSize: 12, color: '#888780', fontWeight: '500' },
  recuVal: { fontSize: 13, color: '#1a1a18', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  recuValHighlight: { fontSize: 16, fontWeight: '800', color: '#0d5068' },
  recuValMono: { fontFamily: 'monospace', fontSize: 11, color: '#5f5e5a' },
  recuValGreen: { color: '#22c55e' },
  praticienNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 14,
    padding: 14, width: '100%', marginBottom: 24,
  },
  praticienNoteText: { flex: 1, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 18 },
  actions: { width: '100%', gap: 10 },
  avisBtn: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  avisBtnText: { fontSize: 15, fontWeight: '700', color: '#0d5068' },
  homeBtn: {
    backgroundColor: '#22c55e', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  homeBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})