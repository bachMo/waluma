import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { getUser, User } from '@/lib/auth'
import api from '@/lib/api'

export default function InfosScreen() {
  const [user, setUser] = useState<User | null>(null)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getUser().then(u => {
      setUser(u)
      if (u) { setPrenom(u.prenom || ''); setNom(u.nom || '') }
    })
  }, [])

  async function handleSave() {
    if (!prenom.trim() || !nom.trim()) {
      Alert.alert('Champs requis', 'Le prénom et le nom sont obligatoires')
      return
    }
    setLoading(true)
    try {
      await api.patch('/auth/profil', { prenom, nom })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Informations personnelles</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

          {saved && (
            <View style={s.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#15803d" />
              <Text style={s.successText}>Modifications sauvegardées</Text>
            </View>
          )}

          <View style={s.section}>
            <Text style={s.sectionTitle}>Identité</Text>
            <View style={s.card}>
              <View style={s.field}>
                <Text style={s.label}>Prénom</Text>
                <TextInput
                  style={s.input}
                  value={prenom}
                  onChangeText={setPrenom}
                  placeholder="Votre prénom"
                  placeholderTextColor="#b4b2a9"
                />
              </View>
              <View style={[s.field, { borderBottomWidth: 0 }]}>
                <Text style={s.label}>Nom</Text>
                <TextInput
                  style={s.input}
                  value={nom}
                  onChangeText={setNom}
                  placeholder="Votre nom"
                  placeholderTextColor="#b4b2a9"
                />
              </View>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Contact</Text>
            <View style={s.card}>
              <View style={[s.field, { borderBottomWidth: 0 }]}>
                <Text style={s.label}>Téléphone</Text>
                <Text style={s.readOnly}>{user?.telephone}</Text>
                <Text style={s.readOnlyHint}>Le numéro de téléphone ne peut pas être modifié</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.saveBtn, loading && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={s.saveBtnText}>Sauvegarder</Text>
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
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dcfce7', margin: 16, borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: '#22c55e' },
  successText: { fontSize: 13, fontWeight: '600', color: '#15803d' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  field: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  label: { fontSize: 11, fontWeight: '700', color: '#888780', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: 15, color: '#1a1a18', fontWeight: '500' },
  readOnly: { fontSize: 15, color: '#1a1a18', fontWeight: '500' },
  readOnlyHint: { fontSize: 11, color: '#b4b2a9', marginTop: 4 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)' },
  saveBtn: { backgroundColor: '#22c55e', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})