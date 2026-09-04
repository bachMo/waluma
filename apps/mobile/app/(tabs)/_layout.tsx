import { Tabs } from 'expo-router'
import { Text } from 'react-native'
import type { ColorValue } from 'react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0d5068',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e4df',
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Mes soins',
          tabBarIcon: ({ color }) => <TabIcon emoji="📋" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
      <Tabs.Screen name="demande" options={{ href: null }} />
      <Tabs.Screen name="suivi" options={{ href: null }} />
      <Tabs.Screen name="avis" options={{ href: null }} />
      <Tabs.Screen name="articles" options={{ href: null }} />
      <Tabs.Screen name="articles/[id]" options={{ href: null }} />
    </Tabs>
  )
}

function TabIcon({ emoji, color }: { emoji: string; color: ColorValue }) {
  const isActive = color === '#0d5068'
  return <Text style={{ fontSize: 22, opacity: isActive ? 1 : 0.5 }}>{emoji}</Text>
}