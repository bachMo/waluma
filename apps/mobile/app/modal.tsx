import { View, Text, StyleSheet } from 'react-native'

export default function ModalScreen() {
  return (
    <View style={s.container}>
      <Text>Modal</Text>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})