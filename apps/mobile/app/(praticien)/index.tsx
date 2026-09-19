import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Switch,
  ActivityIndicator, Alert, RefreshControl, Linking
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useState, useCallback } from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { getUser } from '@/lib/auth'
import api from '@/lib/api'
import { connectSocket } from '@/lib/socket'

interface PraticienData {
  id: string
  disponible: boolean
  bloque: boolean
  statutCompte: string
  totalMissions: number
  noteMoyenne: number | null
  specialites: { specialite: string; principale: boolean }[]
  nbMissionsImpayees: number
}

interface Mission {
  id: string
  statut: string
  specialite: string
  adresseTexte: string
  montantTotal: number
  urgence: boolean
  patient: { nom: string; prenom: string }
  createdAt: string
  paiement: { statut: string } | null
}

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Infirmier·ère IDE', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapeute',
  PRELEVEUR: 'Préleveur·se', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

const STATUT_BADGE: Record<string, { color: string; bg: string; label: string }> = {
  ACCEPTEE: { color: '#0d5068', bg: '#e0f2fe', label: 'Acceptée' },
  EN_ROUTE: { color: '#7c3aed', bg: '#ede9fe', label: 'En route' },
  ARRIVE: { color: '#0891b2', bg: '#cffafe', label: 'Arrivé' },
  EN_COURS: { color: '#d97706', bg: '#fef3c7', label: 'En cours' },
  TERMINEE: { color: '#15803d', bg: '#dcfce7', label: 'Terminée' },
  TERMINEE_IMPAYEE: { color: '#d97706', bg: '#fef3c7', label: 'Paiement en attente' },
  ANNULEE: { color: '#dc2626', bg: '#fee2e2', label: 'Annulée' },
}

// Email de contact admin
const ADMIN_EMAIL = 'support@waluma.sn'

export default function PraticienDashboard() {
  const [userName, setUserName] = useState('')
  const [praticien, setPraticien] = useState<PraticienData | null>(null)
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const user = await getUser()
      if (!user) { router.replace('/(auth)'); return }
      setUserName(user.prenom)
      const [praticienRes, missionsRes] = await Promise.all([
        api.get('/praticiens/me'),
        api.get('/missions?limit=10'),
      ])
      setPraticien(praticienRes.data)
      setMissions(missionsRes.data.missions)

      // Vérifier si une mission est proposée à ce praticien
      try {
        const { data: proposees } = await api.get('/missions/proposees')
        if (proposees.missions.length > 0) {
          router.push({ pathname: '/nouvelle-mission', params: { missionId: proposees.missions[0].id } } as never)
        }
      } catch {}
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(useCallback(() => {
    load()

    let sock: Awaited<ReturnType<typeof connectSocket>> | null = null

    async function initSocket() {
      try {
        sock = await connectSocket()
        sock.on('mission:proposee', (data: { missionId: string }) => {
          router.push({ pathname: '/nouvelle-mission', params: { missionId: data.missionId } } as never)
        })
      } catch (e) {
        console.error('Socket error:', e)
      }
    }

    initSocket()

    return () => {
      sock?.off('mission:proposee')
    }
  }, []))

  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [])

  async function toggleDisponibilite() {
    if (!praticien) return
    if (praticien.statutCompte !== 'VALIDE') {
      Alert.alert('Compte non validé', 'Votre compte doit être validé par un administrateur avant de pouvoir accepter des missions.')
      return
    }
    setToggling(true)
    try {
      await api.patch(`/praticiens/${praticien.id}/disponibilite`)
      setPraticien(p => p ? { ...p, disponible: !p.disponible } : p)
    } finally {
      setToggling(false)
    }
  }

  function contacterAdmin(sujet: string) {
    const body = `Bonjour,\n\nJe souhaite contacter l'administration concernant mon compte Waluma.\n\nSujet : ${sujet}\n\nNom : ${userName}\nIdentifiant praticien : ${praticien?.id ?? ''}`
    Linking.openURL(`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(body)}`)
  }

  const missionActive = missions.find(m => ['ACCEPTEE', 'EN_ROUTE', 'ARRIVE', 'EN_COURS'].includes(m.statut))

  // Déterminer le type de blocage
  const estBloqueAdmin = praticien?.bloque === true
  const estBloqueImpayees = !estBloqueAdmin && (praticien?.nbMissionsImpayees ?? 0) > 0

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <SafeAreaView>
          <View style={s.header}>
            <View style={s.headerTop}>
              <View>
                <Text style={s.headerGreeting}>Bonjour 👋</Text>
                <Text style={s.headerName}>{userName || '...'}</Text>
                {praticien && (
                  <Text style={s.headerSpec}>
                    {SPEC_LABEL[praticien.specialites.find(sp => sp.principale)?.specialite ?? ''] ?? ''}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={s.notifBtn} onPress={() => router.push('/(praticien)/profil')}>
                <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            {/* Bloc disponibilité ou alerte blocage */}
            {estBloqueAdmin ? (
              <View style={s.alerteCard}>
                <View style={s.alerteIcon}>
                  <Ionicons name="lock-closed" size={20} color="#dc2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.alerteTitre}>Compte bloqué</Text>
                  <Text style={s.alerteSub}>
                    Votre compte a été bloqué par l'administration. Vous ne pouvez pas recevoir de missions.
                  </Text>
                  <TouchableOpacity
                    style={s.alerteBtn}
                    onPress={() => contacterAdmin('Demande de déblocage de compte')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="mail-outline" size={13} color="#fff" />
                    <Text style={s.alerteBtnText}>Contacter l'administration</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : estBloqueImpayees ? (
              <View style={[s.alerteCard, s.alerteCardOrange]}>
                <View style={[s.alerteIcon, s.alerteIconOrange]}>
                  <Ionicons name="card-outline" size={20} color="#d97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.alerteTitre, { color: '#fef3c7' }]}>Paiements en attente</Text>
                  <Text style={[s.alerteSub, { color: 'rgba(254,243,199,0.8)' }]}>
                    {praticien!.nbMissionsImpayees} mission{praticien!.nbMissionsImpayees > 1 ? 's' : ''} non payée{praticien!.nbMissionsImpayees > 1 ? 's' : ''}. Vous ne pouvez pas recevoir de nouvelles missions tant que vos patients n'ont pas réglé.
                  </Text>
                  <TouchableOpacity
                    style={[s.alerteBtn, s.alerteBtnOrange]}
                    onPress={() => contacterAdmin('Litige paiement — missions impayées')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flag-outline" size={13} color="#fff" />
                    <Text style={s.alerteBtnText}>Signaler un litige</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={[s.disponCard, praticien?.disponible && s.disponCardOn]}>
                <View style={s.disponLeft}>
                  <View style={[s.disponDot, praticien?.disponible && s.disponDotOn]} />
                  <View>
                    <Text style={s.disponTitle}>{praticien?.disponible ? 'Disponible' : 'Indisponible'}</Text>
                    <Text style={s.disponSub}>
                      {praticien?.disponible ? 'Vous recevrez des demandes de soin' : 'Activez pour recevoir des missions'}
                    </Text>
                  </View>
                </View>
                {toggling
                  ? <ActivityIndicator color={praticien?.disponible ? '#22c55e' : '#888780'} />
                  : <Switch value={praticien?.disponible ?? false} onValueChange={toggleDisponibilite} trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#22c55e' }} thumbColor="#fff" />
                }
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={s.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
      >
        {missionActive && (
          <TouchableOpacity style={s.activeMission} onPress={() => router.push({ pathname: '/(praticien)/mission', params: { missionId: missionActive.id } })} activeOpacity={0.88}>
            <LinearGradient colors={['#22c55e', '#16a34a']} style={s.activeMissionGrad}>
              <View style={s.activeMissionTop}>
                <View style={s.activePulse}><View style={s.activeDot} /></View>
                <Text style={s.activeMissionLabel}>Mission en cours</Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={s.activeMissionSpec}>{SPEC_LABEL[missionActive.specialite]} · {missionActive.patient.prenom} {missionActive.patient.nom}</Text>
              <Text style={s.activeMissionAddr} numberOfLines={1}>{missionActive.adresseTexte}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {praticien && (
          <View style={s.statsRow}>
            {[
              { label: 'Missions', value: praticien.totalMissions.toString(), icon: 'checkmark-circle', color: '#22c55e' },
              { label: 'Note', value: praticien.noteMoyenne ? `${praticien.noteMoyenne.toFixed(1)} ★` : '—', icon: 'star', color: '#f59e0b' },
              { label: 'Statut', value: praticien.statutCompte === 'VALIDE' ? 'Validé' : 'En attente', icon: 'shield-checkmark', color: praticien.statutCompte === 'VALIDE' ? '#22c55e' : '#d97706' },
            ].map(stat => (
              <View key={stat.label} style={s.statCard}>
                <Ionicons name={stat.icon as never} size={22} color={stat.color} style={{ marginBottom: 8 }} />
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Dernières missions</Text>
          {loading ? (
            <ActivityIndicator color="#0d5068" style={{ marginTop: 20 }} />
          ) : missions.length === 0 ? (
            <View style={s.emptyCard}>
              <MaterialCommunityIcons name="needle" size={36} color="#d1d0c9" />
              <Text style={s.emptyText}>Aucune mission pour l'instant</Text>
              <Text style={s.emptySub}>Activez votre disponibilité pour recevoir des demandes</Text>
            </View>
          ) : (
            missions.slice(0, 5).map(m => {
              const statutKey = m.statut === 'TERMINEE' && m.paiements?.[0]?.statut !== 'PAYE'
                ? 'TERMINEE_IMPAYEE'
                : m.statut
              const badge = STATUT_BADGE[statutKey]
              return (
                <TouchableOpacity key={m.id} style={s.missionCard} onPress={() => router.push({ pathname: '/(praticien)/mission', params: { missionId: m.id } })} activeOpacity={0.85}>
                  <View style={[s.missionIcon, m.urgence && s.missionIconUrgent]}>
                    <MaterialCommunityIcons name="needle" size={20} color={m.urgence ? '#dc2626' : '#0d5068'} />
                  </View>
                  <View style={s.missionInfo}>
                    <View style={s.missionTop}>
                      <Text style={s.missionSpec}>{SPEC_LABEL[m.specialite]}</Text>
                      {m.urgence && <View style={s.urgentBadge}><Text style={s.urgentText}>URGENT</Text></View>}
                    </View>
                    <Text style={s.missionPatient}>{m.patient.prenom} {m.patient.nom}</Text>
                    <Text style={s.missionAddr} numberOfLines={1}>{m.adresseTexte}</Text>
                  </View>
                  <View style={s.missionRight}>
                    <Text style={s.missionMontant}>{m.montantTotal.toLocaleString()} F</Text>
                    <Text style={s.missionDate}>{new Date(m.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</Text>
                    {badge && (
                      <View style={[s.statutBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[s.statutText, { color: badge.color }]}>{badge.label}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  headerGrad: {},
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 },
  headerGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  headerName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSpec: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  notifBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  // Toggle disponibilité
  disponCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  disponCardOn: { backgroundColor: 'rgba(34,197,94,0.15)' },
  disponLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  disponDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#888780' },
  disponDotOn: { backgroundColor: '#22c55e' },
  disponTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  disponSub: { fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 15 },
  // Alertes blocage
  alerteCard: { backgroundColor: 'rgba(220,38,38,0.15)', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)' },
  alerteCardOrange: { backgroundColor: 'rgba(217,119,6,0.15)', borderColor: 'rgba(217,119,6,0.3)' },
  alerteIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(220,38,38,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alerteIconOrange: { backgroundColor: 'rgba(217,119,6,0.2)' },
  alerteTitre: { fontSize: 14, fontWeight: '700', color: '#fff', marginBottom: 4 },
  alerteSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 17, marginBottom: 10 },
  alerteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(220,38,38,0.4)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, alignSelf: 'flex-start' },
  alerteBtnOrange: { backgroundColor: 'rgba(217,119,6,0.4)' },
  alerteBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  // Body
  body: { flex: 1 },
  activeMission: { margin: 16, marginBottom: 0, borderRadius: 18, overflow: 'hidden' },
  activeMissionGrad: { padding: 18 },
  activeMissionTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  activePulse: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  activeMissionLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#fff' },
  activeMissionSpec: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginBottom: 4 },
  activeMissionAddr: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1a1a18', marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '600', color: '#888780', textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 12 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 18, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#1a1a18', marginTop: 12, marginBottom: 6 },
  emptySub: { fontSize: 12, color: '#888780', textAlign: 'center', lineHeight: 17 },
  missionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  missionIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  missionIconUrgent: { backgroundColor: '#fee2e2' },
  missionInfo: { flex: 1 },
  missionTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  missionSpec: { fontSize: 13, fontWeight: '700', color: '#1a1a18' },
  urgentBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  urgentText: { fontSize: 9, fontWeight: '800', color: '#dc2626', letterSpacing: 0.5 },
  missionPatient: { fontSize: 12, color: '#5f5e5a', marginBottom: 2 },
  missionAddr: { fontSize: 11, color: '#b4b2a9' },
  missionRight: { alignItems: 'flex-end', gap: 3 },
  missionMontant: { fontSize: 13, fontWeight: '700', color: '#0d5068', marginBottom: 2 },
  missionDate: { fontSize: 10, color: '#b4b2a9', marginBottom: 2 },
  statutBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  statutText: { fontSize: 9, fontWeight: '700' },
})