import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native'
import { router } from 'expo-router'
import { useState, useEffect, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Notif {
  id: string
  titre: string
  message: string
  lu: boolean
  createdAt: string
  type?: string
}

const TYPE_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  MISSION_NOUVELLE: { icon: 'medical', color: '#0d5068', bg: '#e0f2fe' },
  MISSION_EN_ROUTE: { icon: 'car', color: '#7c3aed', bg: '#ede9fe' },
  MISSION_TERMINEE: { icon: 'checkmark-circle', color: '#22c55e', bg: '#dcfce7' },
  MISSION_ANNULEE: { icon: 'close-circle', color: '#dc2626', bg: '#fee2e2' },
  PAIEMENT_CONFIRME: { icon: 'card', color: '#0891b2', bg: '#cffafe' },
  DEFAULT: { icon: 'notifications', color: '#0d5068', bg: '#e0f2fe' },
}

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const { data } = await api.get('/notifications?limit=50')
      setNotifs(data.notifications)
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read')
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })))
    } catch {}
  }

  useEffect(() => { load() }, [])
  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [])

  const nonLues = notifs.filter(n => !n.lu).length

  function formatDate(iso: string) {
    const date = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
    if (diff < 60) return `Il y a ${diff} min`
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={s.headerTitle}>Notifications</Text>
            {nonLues > 0 && <Text style={s.headerSub}>{nonLues} non lue{nonLues > 1 ? 's' : ''}</Text>}
          </View>
          {nonLues > 0 ? (
            <TouchableOpacity style={s.markBtn} onPress={markAllRead}>
              <Text style={s.markBtnText}>Tout lire</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 70 }} />}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#0d5068" size="large" /></View>
      ) : notifs.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}>
            <Ionicons name="notifications-outline" size={40} color="#d1d0c9" />
          </View>
          <Text style={s.emptyTitle}>Aucune notification</Text>
          <Text style={s.emptySub}>Vos notifications apparaîtront ici</Text>
        </View>
      ) : (
        <ScrollView
          style={s.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
        >
          <View style={s.list}>
            {notifs.map(notif => {
              const config = TYPE_ICON[notif.type ?? 'DEFAULT'] ?? TYPE_ICON.DEFAULT
              return (
                <View
                  key={notif.id}
                  style={[s.notifCard, !notif.lu && s.notifCardUnread]}
                >
                  <View style={[s.notifIcon, { backgroundColor: config.bg }]}>
                    <Ionicons name={config.icon as never} size={20} color={config.color} />
                  </View>
                  <View style={s.notifInfo}>
                    <View style={s.notifTop}>
                      <Text style={[s.notifTitre, !notif.lu && s.notifTitreUnread]} numberOfLines={1}>
                        {notif.titre}
                      </Text>
                      {!notif.lu && <View style={s.unreadDot} />}
                    </View>
                    <Text style={s.notifMessage} numberOfLines={2}>{notif.message}</Text>
                    <Text style={s.notifDate}>{formatDate(notif.createdAt)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  headerGrad: {},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', textAlign: 'center' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 2 },
  markBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  markBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#f5f4ef', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#e5e4df' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a18', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#888780', textAlign: 'center' },
  body: { flex: 1 },
  list: { padding: 16, gap: 10 },
  notifCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 14, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  notifCardUnread: { borderLeftWidth: 3, borderLeftColor: '#0d5068' },
  notifIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notifInfo: { flex: 1 },
  notifTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  notifTitre: { flex: 1, fontSize: 14, fontWeight: '600', color: '#5f5e5a' },
  notifTitreUnread: { fontWeight: '800', color: '#1a1a18' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0d5068', flexShrink: 0 },
  notifMessage: { fontSize: 13, color: '#888780', lineHeight: 18, marginBottom: 6 },
  notifDate: { fontSize: 11, color: '#b4b2a9', fontWeight: '500' },
})