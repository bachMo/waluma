import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'

export default function NotFoundScreen() {
  return (
    <View style={s.container}>
      <Text style={s.title}>Page introuvable</Text>
      <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={s.btn}>
        <Text style={s.btnText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '700', color: '#1a1a18', marginBottom: 20 },
  btn: { backgroundColor: '#0d5068', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
})