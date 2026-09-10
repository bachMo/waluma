import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, Platform, Alert
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useState, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import api from '@/lib/api'

interface Demande {
  id: string
  type: string
  description: string
  details: string
  statut: string
  reponseAdmin: string | null
  createdAt: string
  traiteeAt: string | null
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  SPECIALITE: { label: 'Nouvelle spécialité', icon: 'medical-outline', color: '#7c3aed', bg: '#ede9fe' },
  ZONE: { label: 'Zone d\'intervention', icon: 'location-outline', color: '#0891b2', bg: '#cffafe' },
  AUTRE: { label: 'Autre demande', icon: 'help-circle-outline', color: '#6b7280', bg: '#f3f4f6' },
}

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  EN_ATTENTE: { label: 'En attente', color: '#d97706', bg: '#fef3c7', icon: 'time-outline' },
  EN_COURS: { label: 'En cours', color: '#0891b2', bg: '#cffafe', icon: 'refresh-outline' },
  TRAITEE: { label: 'Traitée', color: '#15803d', bg: '#dcfce7', icon: 'checkmark-circle-outline' },
  REFUSEE: { label: 'Refusée', color: '#dc2626', bg: '#fee2e2', icon: 'close-circle-outline' },
}

const MODIFIABLE = ['EN_ATTENTE', 'EN_COURS']

export default function MesDemandesScreen() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selected, setSelected] = useState<Demande | null>(null)

  async function load() {
    try {
      const { data } = await api.get('/demandes/mes-demandes')
      setDemandes(data.demandes)
    } catch {} finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Rafraîchir à chaque fois qu'on revient sur cette page (après création)
  useFocusEffect(useCallback(() => { load() }, []))
  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [])

  async function handleDelete(id: string) {
    Alert.alert('Supprimer la demande', 'Voulez-vous vraiment supprimer cette demande ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/demandes/${id}`)
            setSelected(null)
            load()
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer cette demande')
          }
        },
      },
    ])
  }

  if (selected) {
    const typeConf = TYPE_CONFIG[selected.type] ?? TYPE_CONFIG.AUTRE
    const statutConf = STATUT_CONFIG[selected.statut] ?? STATUT_CONFIG.EN_ATTENTE
    const peutModifier = MODIFIABLE.includes(selected.statut)

    return (
      <View style={s.root}>
        <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
          <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
            <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Détail de la demande</Text>
            <View style={{ width: 36 }} />
          </View>
        </LinearGradient>

        <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
          <View style={[s.statutBanner, { backgroundColor: statutConf.bg }]}>
            <Ionicons name={statutConf.icon as never} size={20} color={statutConf.color} />
            <Text style={[s.statutBannerText, { color: statutConf.color }]}>{statutConf.label}</Text>
          </View>

          <View style={s.detailCard}>
            <View style={s.detailRow}>
              <View style={[s.typeIcon, { backgroundColor: typeConf.bg }]}>
                <Ionicons name={typeConf.icon as never} size={20} color={typeConf.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.detailType}>{typeConf.label}</Text>
                <Text style={s.detailDate}>
                  Envoyée le {new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Votre demande</Text>
            <View style={s.contentCard}>
              <Text style={s.contentText}>{selected.description}</Text>
            </View>
          </View>

          {selected.details ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Informations complémentaires</Text>
              <View style={s.contentCard}>
                <Text style={s.contentText}>{selected.details}</Text>
              </View>
            </View>
          ) : null}

          {selected.reponseAdmin ? (
            <View style={s.section}>
              <Text style={s.sectionTitle}>Réponse de l'équipe Waluma</Text>
              <View style={[s.contentCard, s.reponseCard]}>
                <View style={s.reponseHeader}>
                  <View style={s.reponseAvatar}>
                    <Text style={s.reponseAvatarText}>W</Text>
                  </View>
                  <View>
                    <Text style={s.reponseNom}>Équipe Waluma</Text>
                    {selected.traiteeAt && (
                      <Text style={s.reponseDate}>
                        {new Date(selected.traiteeAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={s.reponseText}>{selected.reponseAdmin}</Text>
              </View>
            </View>
          ) : (
            <View style={s.section}>
              <View style={s.enAttenteCard}>
                <Ionicons name="time-outline" size={20} color="#d97706" />
                <Text style={s.enAttenteText}>
                  Votre demande est en cours de traitement. L'équipe Waluma vous répondra dans les 48h ouvrées.
                </Text>
              </View>
            </View>
          )}

          {peutModifier && (
            <View style={s.actionsSection}>
              <TouchableOpacity
                style={s.editBtn}
                onPress={() => {
                  setSelected(null)
                  router.push({
                    pathname: '/praticien-compte/demande',
                    params: { type: selected.type, editId: selected.id, editDesc: selected.description, editDetails: selected.details },
                  } as never)
                }}
              >
                <Ionicons name="pencil-outline" size={18} color="#0d5068" />
                <Text style={s.editBtnText}>Modifier la demande</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(selected.id)}>
                <Ionicons name="trash-outline" size={18} color="#dc2626" />
                <Text style={s.deleteBtnText}>Supprimer la demande</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Mes demandes</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => router.push('/praticien-compte/demande' as never)}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={s.center}><ActivityIndicator color="#0d5068" size="large" /></View>
      ) : (
        <ScrollView
          style={s.body}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d5068" />}
        >
          {demandes.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="document-outline" size={48} color="#d1d0c9" />
              <Text style={s.emptyTitle}>Aucune demande</Text>
              <Text style={s.emptySub}>Faites une demande pour modifier votre profil professionnel</Text>
              <TouchableOpacity style={s.createBtn} onPress={() => router.push('/praticien-compte/demande' as never)}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={s.createBtnText}>Nouvelle demande</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.list}>
              {demandes.map(d => {
                const typeConf = TYPE_CONFIG[d.type] ?? TYPE_CONFIG.AUTRE
                const statutConf = STATUT_CONFIG[d.statut] ?? STATUT_CONFIG.EN_ATTENTE
                return (
                  <TouchableOpacity key={d.id} style={s.demandeCard} onPress={() => setSelected(d)} activeOpacity={0.85}>
                    <View style={[s.typeIcon, { backgroundColor: typeConf.bg }]}>
                      <Ionicons name={typeConf.icon as never} size={20} color={typeConf.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.demandeType}>{typeConf.label}</Text>
                      <Text style={s.demandeDesc} numberOfLines={2}>{d.description}</Text>
                      <Text style={s.demandeDate}>
                        {new Date(d.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <View style={[s.statutBadge, { backgroundColor: statutConf.bg }]}>
                        <Ionicons name={statutConf.icon as never} size={12} color={statutConf.color} />
                        <Text style={[s.statutText, { color: statutConf.color }]}>{statutConf.label}</Text>
                      </View>
                      {d.reponseAdmin && (
                        <View style={s.reponseDot}>
                          <Text style={s.reponseDotText}>Réponse</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  addBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a18' },
  emptySub: { fontSize: 13, color: '#888780', textAlign: 'center', lineHeight: 19 },
  createBtn: { backgroundColor: '#0d5068', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  createBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  list: { padding: 16, gap: 10 },
  demandeCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  typeIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  demandeType: { fontSize: 14, fontWeight: '700', color: '#1a1a18', marginBottom: 3 },
  demandeDesc: { fontSize: 12, color: '#888780', lineHeight: 17, marginBottom: 4 },
  demandeDate: { fontSize: 11, color: '#b4b2a9' },
  statutBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statutText: { fontSize: 10, fontWeight: '700' },
  reponseDot: { backgroundColor: '#e0f2fe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  reponseDotText: { fontSize: 9, fontWeight: '700', color: '#0d5068' },
  statutBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, borderRadius: 14, padding: 14 },
  statutBannerText: { fontSize: 15, fontWeight: '700' },
  detailCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailType: { fontSize: 15, fontWeight: '700', color: '#1a1a18', marginBottom: 2 },
  detailDate: { fontSize: 12, color: '#888780' },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: '#888780', marginBottom: 10 },
  contentCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  contentText: { fontSize: 14, color: '#3a3a38', lineHeight: 22 },
  reponseCard: { borderLeftWidth: 3, borderLeftColor: '#0d5068' },
  reponseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  reponseAvatar: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#0d5068', alignItems: 'center', justifyContent: 'center' },
  reponseAvatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  reponseNom: { fontSize: 13, fontWeight: '700', color: '#0d5068' },
  reponseDate: { fontSize: 11, color: '#888780' },
  reponseText: { fontSize: 14, color: '#3a3a38', lineHeight: 22 },
  enAttenteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fef3c7', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: '#fcd34d' },
  enAttenteText: { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 19 },
  actionsSection: { paddingHorizontal: 16, marginBottom: 16, gap: 10 },
  editBtn: { backgroundColor: '#e0f2fe', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  editBtnText: { fontSize: 14, fontWeight: '700', color: '#0d5068' },
  deleteBtn: { backgroundColor: '#fee2e2', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  deleteBtnText: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
})