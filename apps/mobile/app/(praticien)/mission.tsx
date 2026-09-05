import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ActivityIndicator,
  StatusBar, Linking
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect, useRef } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Location from 'expo-location'
import api from '@/lib/api'
import { connectSocket, emitPosition } from '@/lib/socket'

interface Mission {
  id: string
  statut: string
  specialite: string
  adresseTexte: string
  latitude: number | null
  longitude: number | null
  montantTotal: number
  montantBase: number
  fraisDeplacement: number
  urgence: boolean
  notePatient: string | null
  createdAt: string
  patient: { nom: string; prenom: string; telephone: string }
}

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers', MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme', KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement', PEDIATRE: 'Pédiatre', AUTRE: 'Autre',
}

const STATUT_STEPS: { statut: string; label: string; action: string; color: string; next: string }[] = [
  { statut: 'ACCEPTEE', label: 'Démarrer le trajet', action: 'EN_ROUTE', color: '#7c3aed', next: 'Praticien trouvé' },
  { statut: 'EN_ROUTE', label: 'Je suis arrivé', action: 'ARRIVE', color: '#0891b2', next: 'En route vers vous' },
  { statut: 'ARRIVE', label: 'Commencer le soin', action: 'EN_COURS', color: '#0d5068', next: 'Arrivé chez vous' },
  { statut: 'EN_COURS', label: 'Terminer et rédiger le CR', action: 'TERMINEE', color: '#22c55e', next: 'Soin en cours' },
]

export default function MissionScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>()
  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const locationSubRef = useRef<Location.LocationSubscription | null>(null)

  async function load() {
    try {
      const { data } = await api.get(`/missions/${missionId}`)
      setMission(data)
    } catch {
      Alert.alert('Erreur', 'Mission introuvable')
      router.back()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)

    // Socket et géolocalisation
    async function initSocketAndLocation() {
      try {
        await connectSocket()

        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status === 'granted' && missionId) {
          const sub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 10 },
            (loc) => {
              emitPosition(missionId, loc.coords.latitude, loc.coords.longitude)
            }
          )
          locationSubRef.current = sub
        }
      } catch (e) {
        console.error('Socket/location error:', e)
      }
    }

    initSocketAndLocation()

    return () => {
      clearInterval(interval)
      locationSubRef.current?.remove()
    }
  }, [missionId])

  async function handleAction(newStatut: string) {
    if (newStatut === 'TERMINEE') {
      router.push({ pathname: '/(praticien)/compte-rendu', params: { missionId: missionId } })
      return
    }
    setActionLoading(true)
    try {
      await api.patch(`/missions/${missionId}/statut`, { statut: newStatut })
      await load()
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut')
    } finally {
      setActionLoading(false)
    }
  }

  function openMaps() {
    if (!mission) return
    const addr = encodeURIComponent(mission.adresseTexte + ', Dakar, Sénégal')
    Linking.openURL(`https://maps.google.com/?q=${addr}`)
  }

  function callPatient() {
    if (!mission) return
    Linking.openURL(`tel:${mission.patient.telephone}`)
  }

  const currentStep = STATUT_STEPS.find(s => s.statut === mission?.statut)
  const stepIndex = STATUT_STEPS.findIndex(s => s.statut === mission?.statut)

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#0d5068" size="large" />
      </View>
    )
  }

  if (!mission) return null

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <SafeAreaView>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Mission en cours</Text>
            {mission.urgence && (
              <View style={s.urgentBadge}>
                <Text style={s.urgentText}>URGENT</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* Patient card */}
        <View style={s.patientCard}>
          <LinearGradient colors={['#e0f2fe', '#f0fdf4']} style={s.patientAvatar}>
            <Text style={s.patientAvatarText}>
              {mission.patient.prenom[0]}{mission.patient.nom[0]}
            </Text>
          </LinearGradient>
          <View style={s.patientInfo}>
            <Text style={s.patientName}>{mission.patient.prenom} {mission.patient.nom}</Text>
            <Text style={s.patientSpec}>{SPEC_LABEL[mission.specialite]}</Text>
            <Text style={s.patientAddr} numberOfLines={2}>{mission.adresseTexte}</Text>
          </View>
          <View style={s.patientActions}>
            <TouchableOpacity style={s.actionBtn} onPress={callPatient}>
              <Ionicons name="call" size={20} color="#0d5068" />
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, s.actionBtnGreen]} onPress={openMaps}>
              <Ionicons name="navigate" size={20} color="#22c55e" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Note du patient */}
        {mission.notePatient && (
          <View style={s.noteCard}>
            <View style={s.noteHeader}>
              <Ionicons name="information-circle-outline" size={18} color="#0d5068" />
              <Text style={s.noteTitle}>Note du patient</Text>
            </View>
            <Text style={s.noteText}>{mission.notePatient}</Text>
          </View>
        )}

        {/* Progression */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Progression de la mission</Text>
          <View style={s.timeline}>
            {STATUT_STEPS.map((step, i) => {
              const isDone = i < stepIndex
              const isActive = i === stepIndex
              return (
                <View key={step.statut} style={s.timelineRow}>
                  <View style={s.timelineLeft}>
                    <View style={[
                      s.timelineDot,
                      isDone && s.timelineDotDone,
                      isActive && { backgroundColor: step.color, borderColor: step.color },
                    ]}>
                      {isDone && <Ionicons name="checkmark" size={12} color="#fff" />}
                      {isActive && <View style={s.timelineDotInner} />}
                    </View>
                    {i < STATUT_STEPS.length - 1 && (
                      <View style={[s.timelineLine, isDone && s.timelineLineDone]} />
                    )}
                  </View>
                  <View style={s.timelineContent}>
                    <Text style={[
                      s.timelineLabel,
                      isDone && s.timelineLabelDone,
                      isActive && { color: '#1a1a18', fontWeight: '700' },
                    ]}>
                      {step.next}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Récapitulatif financier */}
        <View style={s.financeCard}>
          <Text style={s.financeTitle}>Votre gain pour cette mission</Text>
          <View style={s.financeRow}>
            <Text style={s.financeLabel}>Soin</Text>
            <Text style={s.financeVal}>{mission.montantBase.toLocaleString()} F</Text>
          </View>
          <View style={s.financeRow}>
            <Text style={s.financeLabel}>Déplacement</Text>
            <Text style={s.financeVal}>{mission.fraisDeplacement.toLocaleString()} F</Text>
          </View>
          <View style={s.financeRow}>
            <Text style={s.financeLabel}>Commission Waluma (10%)</Text>
            <Text style={[s.financeVal, { color: '#dc2626' }]}>
              -{Math.round(mission.montantTotal * 0.1).toLocaleString()} F
            </Text>
          </View>
          <View style={[s.financeRow, s.financeTotalRow]}>
            <Text style={s.financeTotalLabel}>Votre gain net</Text>
            <Text style={s.financeTotalVal}>
              {Math.round(mission.montantTotal * 0.9).toLocaleString()} FCFA
            </Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* CTA action */}
      {currentStep && mission.statut !== 'TERMINEE' && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.ctaBtn, { backgroundColor: currentStep.color }, actionLoading && s.ctaBtnDisabled]}
            onPress={() => handleAction(currentStep.action)}
            disabled={actionLoading}
            activeOpacity={0.88}
          >
            {actionLoading
              ? <ActivityIndicator color="#fff" />
              : <>
                <Text style={s.ctaBtnText}>{currentStep.label}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerGrad: {},
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#fff' },
  urgentBadge: { backgroundColor: '#dc2626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  urgentText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  body: { flex: 1 },
  patientCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  patientAvatar: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  patientAvatarText: { fontSize: 20, fontWeight: '800', color: '#0d5068' },
  patientInfo: { flex: 1 },
  patientName: { fontSize: 16, fontWeight: '800', color: '#1a1a18', marginBottom: 2 },
  patientSpec: { fontSize: 12, fontWeight: '600', color: '#0d5068', marginBottom: 4 },
  patientAddr: { fontSize: 12, color: '#888780', lineHeight: 17 },
  patientActions: { gap: 8 },
  actionBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  actionBtnGreen: { backgroundColor: '#dcfce7' },
  noteCard: {
    backgroundColor: '#fef3c7', marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: '#fcd34d',
  },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  noteTitle: { fontSize: 12, fontWeight: '700', color: '#0d5068' },
  noteText: { fontSize: 13, color: '#5f5e5a', lineHeight: 19 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 16 },
  timeline: { backgroundColor: '#fff', borderRadius: 18, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 28 },
  timelineDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#f1f0eb', borderWidth: 1.5, borderColor: '#e5e4df',
    alignItems: 'center', justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  timelineDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  timelineLine: { width: 1.5, flex: 1, backgroundColor: '#e5e4df', minHeight: 24, marginVertical: 4 },
  timelineLineDone: { backgroundColor: '#22c55e' },
  timelineContent: { flex: 1, paddingBottom: 24 },
  timelineLabel: { fontSize: 14, color: '#b4b2a9', fontWeight: '500' },
  timelineLabelDone: { color: '#22c55e' },
  financeCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  financeTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 14 },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.06)' },
  financeLabel: { fontSize: 13, color: '#888780' },
  financeVal: { fontSize: 13, fontWeight: '600', color: '#1a1a18' },
  financeTotalRow: { borderBottomWidth: 0, paddingTop: 12, marginTop: 4 },
  financeTotalLabel: { fontSize: 15, fontWeight: '800', color: '#1a1a18' },
  financeTotalVal: { fontSize: 15, fontWeight: '800', color: '#22c55e' },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.06)' },
  ctaBtn: {
    borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
})