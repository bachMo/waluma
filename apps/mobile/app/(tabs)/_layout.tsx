import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { View, Platform } from 'react-native'
import type { ColorValue } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#b4b2a9',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 12,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Mes soins',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'clipboard' : 'clipboard-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="demande" options={{ href: null }} />
      <Tabs.Screen name="suivi" options={{ href: null }} />
      <Tabs.Screen name="avis" options={{ href: null }} />
      <Tabs.Screen name="articles" options={{ href: null }} />
      <Tabs.Screen name="articles/[id]" options={{ href: null }} />
      <Tabs.Screen name="paiement" options={{ href: null }} />
<Tabs.Screen name="confirmation-paiement" options={{ href: null }} />
    </Tabs>
  )
}

function TabIcon({ name, color, focused }: { name: string; color: ColorValue; focused: boolean }) {
  return (
    <View style={{
      alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: 12,
      backgroundColor: focused ? 'rgba(34,197,94,0.12)' : 'transparent',
    }}>
      <Ionicons name={name as never} size={22} color={color} />
    </View>
  )
}