import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native'
import { router } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const ADRESSES_EXEMPLES = [
  { id: '1', label: 'Domicile', adresse: 'Villa 12, Almadies, Dakar', principale: true },
  { id: '2', label: 'Bureau', adresse: 'Immeuble Fahd, Plateau, Dakar', principale: false },
]

export default function AdressesScreen() {
  const [adresses, setAdresses] = useState(ADRESSES_EXEMPLES)
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState('')
  const [adresse, setAdresse] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!label.trim() || !adresse.trim()) {
      Alert.alert('Champs requis', 'Le libellé et l\'adresse sont obligatoires')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setAdresses(prev => [...prev, { id: Date.now().toString(), label, adresse, principale: false }])
      setLabel('')
      setAdresse('')
      setShowForm(false)
      setSaving(false)
    }, 800)
  }

  function handleDelete(id: string) {
    Alert.alert('Supprimer l\'adresse', 'Voulez-vous vraiment supprimer cette adresse ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setAdresses(prev => prev.filter(a => a.id !== id)) },
    ])
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Mes adresses</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(!showForm)}>
            <Ionicons name={showForm ? 'close' : 'add'} size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={s.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {showForm && (
            <View style={s.formCard}>
              <Text style={s.formTitle}>Nouvelle adresse</Text>
              <View style={s.field}>
                <Text style={s.label}>Libellé</Text>
                <TextInput style={s.input} value={label} onChangeText={setLabel} placeholder="Ex : Domicile, Bureau..." placeholderTextColor="#b4b2a9" />
              </View>
              <View style={[s.field, { borderBottomWidth: 0 }]}>
                <Text style={s.label}>Adresse complète</Text>
                <TextInput style={[s.input, { minHeight: 60 }]} value={adresse} onChangeText={setAdresse} placeholder="Ex : Villa 12, Almadies, Dakar" placeholderTextColor="#b4b2a9" multiline />
              </View>
              <TouchableOpacity style={[s.saveBtn, saving && s.saveBtnDisabled]} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.saveBtnText}>Ajouter l'adresse</Text>}
              </TouchableOpacity>
            </View>
          )}

          <View style={s.section}>
            <Text style={s.sectionTitle}>Mes adresses enregistrées</Text>
            {adresses.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="location-outline" size={40} color="#d1d0c9" />
                <Text style={s.emptyTitle}>Aucune adresse</Text>
              </View>
            ) : (
              <View style={s.card}>
                {adresses.map((a, i) => (
                  <View key={a.id} style={[s.adresseRow, i < adresses.length - 1 && s.rowBorder]}>
                    <View style={[s.adresseIcon, a.principale && s.adresseIconPrinc]}>
                      <Ionicons name="location" size={18} color={a.principale ? '#22c55e' : '#0d5068'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={s.adresseTop}>
                        <Text style={s.adresseLabel}>{a.label}</Text>
                        {a.principale && (
                          <View style={s.princBadge}>
                            <Text style={s.princText}>Principale</Text>
                          </View>
                        )}
                      </View>
                      <Text style={s.adresseTexte}>{a.adresse}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDelete(a.id)} style={s.deleteBtn}>
                      <Ionicons name="trash-outline" size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
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
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  formCard: { backgroundColor: '#fff', margin: 16, borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  formTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a18', marginBottom: 16 },
  field: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)', paddingBottom: 12, marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', color: '#888780', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: 15, color: '#1a1a18', fontWeight: '500' },
  saveBtn: { backgroundColor: '#22c55e', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  adresseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  adresseIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  adresseIconPrinc: { backgroundColor: '#dcfce7' },
  adresseTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  adresseLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a18' },
  adresseTexte: { fontSize: 12, color: '#888780' },
  princBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  princText: { fontSize: 10, fontWeight: '700', color: '#15803d' },
  deleteBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#888780' },
})