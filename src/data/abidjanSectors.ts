export const SECTEURS_ABIDJAN: Record<string, Record<string, string[]>> = {
  Yopougon: {
    Maroc: [
      'Maroc Antenne',
      'Maroc Ananeraie',
      'Carrefour Maroc',
      'Maroc Tiken Jah',
    ],
    Niangon: [
      'Niangon Nord',
      'Niangon Sud',
      'Niangon Sud à droite',
      'Niangon Sud à gauche',
      'Niangon Sud Sicogi',
    ],
    Ananeraie: ['Ananeraie', 'Cité Verte', 'Lièvre Rouge'],
    'Autres secteurs': [
      'Siporex',
      'Selmer',
      'Sideci',
      'Wassakara',
      'Sogefiha',
      'Gesco',
      'Andokoi',
      'Kouté',
      'Banco',
      'Toits-Rouges',
      'Nouveau Quartier',
      'Port-Bouët 2',
      'Millionnaire',
      'Sicobois',
      'Yao Séhi',
    ],
  },

  Abobo: {
    Centre: ['Abobo Gare', 'Abobo Centre', 'Mairie', 'Marché'],
    'Autres secteurs': [
      'Avocatier',
      'Anonkoi',
      'Agbekoi',
      'Plateau-Dokui',
      'Banco',
      'Akeikoi',
      'Clouetcha',
      "N'Guessankoi",
      'Abobo-Té',
      "M'Ponon",
      'Abobo Baoulé',
      'Sogefiha',
      'Sogemac',
    ],
  },

  Cocody: {
    'Deux-Plateaux': ['Vallons', '7e Tranche', '8e Tranche', 'Aghien', 'ENA'],
    Angré: [
      'Angré Château',
      'Angré Djibi',
      'Angré 7e Tranche',
      'Angré Nouveau CHU',
    ],
    Riviera: [
      'Riviera 1',
      'Riviera 2',
      'Riviera 3',
      'Riviera 4',
      'Riviera 5',
      'Riviera Palmeraie',
      'Riviera Golf',
      "Riviera M'Badon",
    ],
    'Autres secteurs': [
      'Bonoumin',
      'Faya',
      'Danga',
      'Blockhauss',
      'Akouédo',
      'Attoban',
      'Abatta',
      'Djorogobité',
      'Mermoz',
    ],
  },

  Adjamé: {
    Centre: ['Mairie', "Marché d'Adjamé", 'Gare routière'],
    'Autres secteurs': [
      'Liberté',
      '220 Logements',
      'Williamsville',
      'Saint-Michel',
      'Habitat',
      'Bracodi',
      'Indénié',
      'Mirador',
      'Renault',
    ],
  },

  Attécoubé: {
    Centre: ['Attécoubé Centre', 'Mairie'],
    'Autres secteurs': [
      'Abobo-Doumé',
      'Locodjro',
      'Banco',
      'Boribana',
      'Mossikro',
      'Jérusalem',
      'Bidjan-Santé',
    ],
  },

  Plateau: {
    Secteurs: [
      'Plateau Administratif',
      'Cité Administrative',
      'Quartier des Banques',
      'Avenue Chardy',
      'Avenue Noguès',
      'Indénié',
      'Cathédrale Saint-Paul',
    ],
  },

  Marcory: {
    'Zone 4': ['Zone 4A', 'Zone 4B', 'Zone 4C'],
    'Autres secteurs': [
      'Biétry',
      'Marcory Résidentiel',
      'Anoumabo',
      'Aliodan',
      'Champroux',
      'Sans-Fil',
      'Remblais',
      'Grand Carrefour',
      'Hibiscus',
    ],
  },

  Koumassi: {
    Centre: ['Koumassi Centre', 'Mairie', 'Grand Marché'],
    'Autres secteurs': [
      'Sicogi',
      'Campement',
      'Remblais',
      'Divo',
      'Prodomo',
      'Grand Carrefour',
      'Zone Industrielle',
      'Zoé Bruno',
      'Quartier 05',
    ],
  },

  Treichville: {
    Centre: ['Treichville Centre', 'Mairie', 'Marché'],
    'Autres secteurs': [
      'Arras',
      'Biafra',
      'Belleville',
      'France-Amérique',
      'Avenue 8',
      'Avenue 13',
      'Avenue 16',
      'Zone Portuaire',
    ],
  },

  'Port-Bouët': {
    Centre: ['Port-Bouët Centre', 'Mairie', 'Marché'],
    'Autres secteurs': [
      'Vridi Cité',
      'Vridi Canal',
      'Vridi Industriel',
      'Gonzagueville',
      'Adjouffou',
      'Jean-Folly',
      'Abattoir',
      'Aéroport',
      'Derrière Wharf',
      'Petit-Bassam',
    ],
  },

  Bingerville: {
    Centre: ['Bingerville Centre', 'Mairie', 'Marché'],
    'Autres secteurs': [
      'Feh Kessé',
      "M'Batto",
      'Gbagba',
      'Akandjé',
      'Faya',
      'Eloka',
    ],
  },

  Anyama: {
    Centre: ['Anyama Centre', 'Anyama Gare', 'Mairie', 'Marché'],
    'Autres secteurs': ['Ahouabo', 'Schneider', 'Résidentiel', 'Azaguié-Ahoua'],
  },

  Songon: {
    Centre: ['Songon Centre', 'Mairie'],
    'Autres secteurs': [
      'Songon-Agban',
      'Songon-Dagbé',
      'Songon-Kassemblé',
      'Bimbresso',
      'Adiopodoumé',
      'Kouté',
    ],
  },
};

export const getCommunes = (): string[] => Object.keys(SECTEURS_ABIDJAN);

export const getQuartiers = (commune: string): string[] => {
  if (!commune || !SECTEURS_ABIDJAN[commune]) return [];
  return Object.keys(SECTEURS_ABIDJAN[commune]);
};

export const getSecteurs = (commune: string, quartier: string): string[] => {
  if (!commune || !quartier || !SECTEURS_ABIDJAN[commune]?.[quartier]) return [];
  return SECTEURS_ABIDJAN[commune][quartier];
};
