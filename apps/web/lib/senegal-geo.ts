export interface Region {
  nom: string
  code: string
  departements: string[]
}

export const REGIONS_SENEGAL: Region[] = [
  {
    nom: 'Dakar',
    code: 'DK',
    departements: ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque', 'Bargny', 'Diamniadio', 'Sébikotane', 'Sangalkam'],
  },
  {
    nom: 'Thiès',
    code: 'TH',
    departements: ['Thiès', 'Mbour', 'Tivaouane', 'Kayar', 'Joal-Fadiouth', 'Pout', 'Sindia'],
  },
  {
    nom: 'Saint-Louis',
    code: 'SL',
    departements: ['Saint-Louis', 'Dagana', 'Podor', 'Richard Toll', 'Rosso-Sénégal'],
  },
  {
    nom: 'Diourbel',
    code: 'DB',
    departements: ['Diourbel', 'Bambey', 'Mbacké', 'Touba'],
  },
  {
    nom: 'Fatick',
    code: 'FK',
    departements: ['Fatick', 'Foundiougne', 'Gossas'],
  },
  {
    nom: 'Kaolack',
    code: 'KL',
    departements: ['Kaolack', 'Guinguinéo', 'Nioro du Rip'],
  },
  {
    nom: 'Ziguinchor',
    code: 'ZG',
    departements: ['Ziguinchor', 'Bignona', 'Oussouye'],
  },
  {
    nom: 'Louga',
    code: 'LG',
    departements: ['Louga', 'Kébémer', 'Linguère'],
  },
  {
    nom: 'Tambacounda',
    code: 'TC',
    departements: ['Tambacounda', 'Bakel', 'Goudiry', 'Koumpentoum'],
  },
  {
    nom: 'Kolda',
    code: 'KD',
    departements: ['Kolda', 'Médina Yoro Foulah', 'Vélingara'],
  },
  {
    nom: 'Matam',
    code: 'MT',
    departements: ['Matam', 'Kanel', 'Ranérou'],
  },
  {
    nom: 'Kaffrine',
    code: 'KF',
    departements: ['Kaffrine', 'Birkilane', 'Koungheul', 'Malem Hoddar'],
  },
  {
    nom: 'Kédougou',
    code: 'KG',
    departements: ['Kédougou', 'Salemata', 'Saraya'],
  },
  {
    nom: 'Sédhiou',
    code: 'SD',
    departements: ['Sédhiou', 'Bounkiling', 'Goudomp'],
  },
]