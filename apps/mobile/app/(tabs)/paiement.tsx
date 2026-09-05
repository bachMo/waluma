import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert,
  ActivityIndicator, Dimensions
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useState, useEffect } from 'react'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

const { width } = Dimensions.get('window')

interface MissionPaiement {
  id: string
  specialite: string
  adresseTexte: string
  montantBase: number
  fraisDeplacement: number
  montantTotal: number
  praticien: { user: { nom: string; prenom: string } } | null
}

const OPERATEURS = [
  {
    key: 'WAVE',
    label: 'Wave',
    color: '#1E88E5',
    bg: '#E3F2FD',
    icon: 'waves',
    description: 'Paiement instantané',
  },
  {
    key: 'ORANGE_MONEY',
    label: 'Orange Money',
    color: '#FF6600',
    bg: '#FFF3E0',
    icon: 'cash',
    description: 'Orange Money Sénégal',
  },
  {
    key: 'FREE_MONEY',
    label: 'Free Money',
    color: '#E53935',
    bg: '#FFEBEE',
    icon: 'cellphone',
    description: 'Free Money Sénégal',
  },
]

const SPEC_LABEL: Record<string, string> = {
  INFIRMIER: 'Soins infirmiers',
  MEDECIN_GENERALISTE: 'Médecin généraliste',
  SAGE_FEMME: 'Sage-femme',
  KINESITHERAPEUTE: 'Kinésithérapie',
  PRELEVEUR: 'Prélèvement',
  PEDIATRE: 'Pédiatre',
  AUTRE: 'Autre',
}

export default function PaiementScreen() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>()
  const [mission, setMission] = useState<MissionPaiement | null>(null)
  const [loading, setLoading] = useState(true)
  const [operateur, setOperateur] = useState('WAVE')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/paiements/mission/${missionId}`)
        if (data.paiement?.statut === 'PAYE') {
          router.replace({
            pathname: '/(tabs)/confirmation-paiement',
            params: { missionId, paiementId: data.paiement.id },
          })
          return
        }
        setMission(data.mission)
      } catch {
        Alert.alert('Erreur', 'Impossible de charger les détails')
        router.back()
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [missionId])

  async function handlePayer() {
    if (!mission) return

    Alert.alert(
      'Confirmer le paiement',
      `Payer ${mission.montantTotal.toLocaleString()} FCFA via ${OPERATEURS.find(o => o.key === operateur)?.label} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setPaying(true)
            try {
              // Initier le paiement
              const { data: initData } = await api.post('/paiements', {
                missionId: mission.id,
                operateur,
              })

              // Confirmer le paiement (simulé)
              await api.post(`/paiements/${initData.paiement.id}/confirmer`, {})

              router.replace({
                pathname: '/(tabs)/confirmation-paiement',
                params: {
                  missionId: mission.id,
                  paiementId: initData.paiement.id,
                  montant: mission.montantTotal.toString(),
                  operateur,
                },
              })
            } catch (e: unknown) {
              const err = e as { response?: { data?: { error?: string } } }
              Alert.alert('Erreur', err?.response?.data?.error || 'Paiement échoué')
            } finally {
              setPaying(false)
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color="#0d5068" size="large" />
      </View>
    )
  }

  if (!mission) return null

  const selectedOp = OPERATEURS.find(o => o.key === operateur)!

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <SafeAreaView>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Paiement</Text>
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>

        {/* Récapitulatif soin */}
        <View style={s.recapCard}>
          <View style={s.recapHeader}>
            <View style={s.recapIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            </View>
            <View style={s.recapInfo}>
              <Text style={s.recapTitle}>Soin terminé</Text>
              <Text style={s.recapSub}>{SPEC_LABEL[mission.specialite]}</Text>
            </View>
          </View>

          {mission.praticien && (
            <View style={s.praticienRow}>
              <View style={s.praticienAvatar}>
                <Text style={s.praticienAvatarText}>
                  {mission.praticien.user.prenom[0]}{mission.praticien.user.nom[0]}
                </Text>
              </View>
              <Text style={s.praticienName}>
                {mission.praticien.user.prenom} {mission.praticien.user.nom}
              </Text>
            </View>
          )}

          <View style={s.divider} />

          <View style={s.ligneRow}>
            <Text style={s.ligneLabel}>{SPEC_LABEL[mission.specialite]}</Text>
            <Text style={s.ligneVal}>{mission.montantBase.toLocaleString()} F</Text>
          </View>
          <View style={s.ligneRow}>
            <Text style={s.ligneLabel}>Frais de déplacement</Text>
            <Text style={s.ligneVal}>{mission.fraisDeplacement.toLocaleString()} F</Text>
          </View>
          <View style={[s.ligneRow, s.totalRow]}>
            <Text style={s.totalLabel}>Total à payer</Text>
            <Text style={s.totalVal}>{mission.montantTotal.toLocaleString()} FCFA</Text>
          </View>
        </View>

        {/* Choix opérateur */}
        <Text style={s.sectionTitle}>Mode de paiement</Text>
        <View style={s.operateursGrid}>
          {OPERATEURS.map(op => (
            <TouchableOpacity
              key={op.key}
              style={[
                s.operateurCard,
                operateur === op.key && { borderColor: op.color, borderWidth: 2 },
              ]}
              onPress={() => setOperateur(op.key)}
              activeOpacity={0.85}
            >
              {operateur === op.key && (
                <View style={[s.checkBadge, { backgroundColor: op.color }]}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
              <View style={[s.opIconWrap, { backgroundColor: op.bg }]}>
                <MaterialCommunityIcons name={op.icon as never} size={28} color={op.color} />
              </View>
              <Text style={s.opLabel}>{op.label}</Text>
              <Text style={s.opDesc}>{op.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info paiement sécurisé */}
        <View style={s.secureCard}>
          <Ionicons name="shield-checkmark" size={18} color="#22c55e" />
          <View style={{ flex: 1 }}>
            <Text style={s.secureTitle}>Paiement sécurisé</Text>
            <Text style={s.secureSub}>
              Votre transaction est protégée. Aucune donnée bancaire n'est stockée sur nos serveurs.
            </Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer paiement */}
      <View style={s.footer}>
        <View style={s.footerInfo}>
          <Text style={s.footerLabel}>Montant</Text>
          <Text style={s.footerAmount}>{mission.montantTotal.toLocaleString()} FCFA</Text>
        </View>
        <TouchableOpacity
          style={[s.payBtn, paying && s.payBtnDisabled]}
          onPress={handlePayer}
          disabled={paying}
          activeOpacity={0.88}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons
                name={selectedOp.icon as never}
                size={20}
                color="#fff"
              />
              <Text style={s.payBtnText}>Payer via {selectedOp.label}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f4ef' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerGrad: {},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  body: { flex: 1 },
  recapCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 20, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  recapHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  recapIcon: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center',
  },
  recapInfo: { flex: 1 },
  recapTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a18', marginBottom: 2 },
  recapSub: { fontSize: 13, color: '#888780' },
  praticienRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f5f4ef', borderRadius: 12, padding: 12, marginBottom: 16,
  },
  praticienAvatar: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center',
  },
  praticienAvatarText: { fontSize: 13, fontWeight: '700', color: '#0d5068' },
  praticienName: { fontSize: 14, fontWeight: '600', color: '#1a1a18' },
  divider: { height: 0.5, backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: 14 },
  ligneRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 7,
  },
  ligneLabel: { fontSize: 13, color: '#888780' },
  ligneVal: { fontSize: 13, color: '#1a1a18' },
  totalRow: {
    borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)',
    marginTop: 8, paddingTop: 14,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#1a1a18' },
  totalVal: { fontSize: 16, fontWeight: '800', color: '#22c55e' },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#888780',
    marginHorizontal: 16, marginBottom: 12,
  },
  operateursGrid: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16,
  },
  operateurCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent',
    position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  opIconWrap: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  opLabel: { fontSize: 12, fontWeight: '700', color: '#1a1a18', marginBottom: 3 },
  opDesc: { fontSize: 10, color: '#888780', textAlign: 'center' },
  secureCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#f0fdf4', marginHorizontal: 16,
    borderRadius: 14, padding: 14,
    borderWidth: 0.5, borderColor: 'rgba(34,197,94,0.2)',
  },
  secureTitle: { fontSize: 13, fontWeight: '700', color: '#15803d', marginBottom: 3 },
  secureSub: { fontSize: 11, color: '#5f5e5a', lineHeight: 16 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 16,
    borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)',
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 8,
  },
  footerInfo: { flex: 1 },
  footerLabel: { fontSize: 11, color: '#888780', fontWeight: '600' },
  footerAmount: { fontSize: 20, fontWeight: '800', color: '#1a1a18', letterSpacing: -0.5 },
  payBtn: {
    flex: 2, backgroundColor: '#22c55e', borderRadius: 16,
    padding: 16, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
})