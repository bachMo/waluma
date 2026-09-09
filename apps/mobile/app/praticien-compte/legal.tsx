import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Linking
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const CONTENT: Record<string, { title: string; sections: { heading?: string; body: string }[] }> = {
  politique: {
    title: 'Politique de confidentialité',
    sections: [
      { heading: 'Introduction', body: 'Waluma s\'engage à protéger vos données personnelles conformément au RGPD et à la loi sénégalaise sur la protection des données personnelles (loi n° 2008-12 du 25 janvier 2008).' },
      { heading: 'Données collectées', body: 'Nous collectons : votre numéro de téléphone (identifiant unique), votre nom et prénom, vos adresses de soin, l\'historique de vos missions et paiements. Pour les praticiens : documents professionnels, numéro d\'ordre, spécialités.' },
      { heading: 'Utilisation des données', body: 'Vos données sont utilisées exclusivement pour : la mise en relation patient-praticien, le traitement des paiements, l\'amélioration de nos services, et les communications liées à vos soins.' },
      { heading: 'Conservation', body: 'Vos données sont conservées pendant la durée de votre relation avec Waluma, puis archivées 5 ans conformément aux obligations légales médicales.' },
      { heading: 'Vos droits', body: 'Vous disposez d\'un droit d\'accès, de rectification, de suppression et de portabilité de vos données. Pour toute demande : privacy@waluma.sn' },
      { heading: 'Sécurité', body: 'Toutes vos données sont chiffrées en transit (HTTPS) et au repos. L\'accès est strictement limité aux équipes autorisées.' },
    ],
  },
  cgu: {
    title: "Conditions Générales d'Utilisation",
    sections: [
      { heading: 'Objet', body: 'Les présentes CGU régissent l\'utilisation de la plateforme Waluma, service de mise en relation entre patients et professionnels de santé à domicile au Sénégal.' },
      { heading: 'Inscription', body: 'L\'inscription est réservée aux personnes majeures. Pour les praticiens, un processus de vérification des diplômes et documents professionnels est obligatoire avant toute activité.' },
      { heading: 'Responsabilités', body: 'Waluma est une plateforme de mise en relation. La responsabilité médicale reste entièrement celle du praticien. Waluma ne saurait être tenu responsable d\'un acte médical.' },
      { heading: 'Paiement', body: 'Le paiement est effectué après la réalisation du soin. Waluma prélève une commission de 10% sur chaque mission. Les paiements sont sécurisés via les opérateurs Mobile Money agréés.' },
      { heading: 'Annulation', body: 'Une mission peut être annulée sans frais avant qu\'elle soit EN_ROUTE. Au-delà, des frais d\'annulation peuvent s\'appliquer.' },
      { heading: 'Résiliation', body: 'Waluma se réserve le droit de suspendre ou résilier tout compte en cas de violation des présentes CGU, de comportement inapproprié, ou de fraude avérée.' },
    ],
  },
  aide: {
    title: 'Aide et Support',
    sections: [
      { heading: 'Comment demander un soin ?', body: 'Depuis l\'accueil, appuyez sur "Demander un soin", choisissez le type de soin, entrez votre adresse et confirmez. Un praticien vous sera assigné automatiquement.' },
      { heading: 'Comment payer ?', body: 'Le paiement se fait après le soin via Wave, Orange Money ou Free Money. Vous recevrez une notification quand le soin est terminé.' },
      { heading: 'Que faire si le praticien ne vient pas ?', body: 'Annulez la mission depuis l\'écran de suivi et signalez un problème. Notre équipe vous contactera dans les 24h.' },
      { heading: 'Comment contacter le praticien ?', body: 'Depuis l\'écran de suivi de votre mission, appuyez sur l\'icône téléphone à côté du nom du praticien.' },
      { heading: 'Problème avec une mission ?', body: 'Depuis l\'écran de suivi, appuyez sur "Signaler un problème" pour créer un litige. Notre équipe traitera votre demande sous 24h.' },
      { heading: 'Contact direct', body: 'Email : support@waluma.sn\nWhatsApp : +221 77 000 00 00\nDu lundi au samedi, 8h - 20h' },
    ],
  },
}

export default function LegalScreen() {
  const { type } = useLocalSearchParams<{ type: string }>()
  const content = CONTENT[type ?? 'politique'] ?? CONTENT.politique

  return (
    <View style={s.root}>
      <LinearGradient colors={['#0d5068', '#083d50']} style={s.headerGrad}>
        <View style={[s.header, { paddingTop: Platform.OS === 'android' ? 40 : 60 }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>{content.title}</Text>
          <View style={{ width: 36 }} />
        </View>
      </LinearGradient>

      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
        <View style={s.content}>
          {content.sections.map((section, i) => (
            <View key={i} style={s.section}>
              {section.heading && <Text style={s.heading}>{section.heading}</Text>}
              <Text style={s.body_text}>{section.body}</Text>
            </View>
          ))}

          {type === 'aide' && (
            <TouchableOpacity
              style={s.contactBtn}
              onPress={() => Linking.openURL('mailto:support@waluma.sn')}
            >
              <Ionicons name="mail-outline" size={18} color="#0d5068" />
              <Text style={s.contactBtnText}>Envoyer un email au support</Text>
            </TouchableOpacity>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center', marginHorizontal: 8 },
  body: { flex: 1 },
  content: { padding: 20, gap: 20 },
  section: { backgroundColor: '#fff', borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  heading: { fontSize: 15, fontWeight: '800', color: '#0d5068', marginBottom: 10 },
  body_text: { fontSize: 14, color: '#3a3a38', lineHeight: 22 },
  contactBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1.5, borderColor: '#0d5068' },
  contactBtnText: { fontSize: 15, fontWeight: '700', color: '#0d5068' },
})