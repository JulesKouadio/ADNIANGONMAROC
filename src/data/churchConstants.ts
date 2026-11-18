import {
  ContactFrequency,
  CourseProgress,
  DiscipleshipQuality,
  WelcomeContextType,
} from '../types';

export const ASSEMBLEE_DEPARTMENTS: string[] = [
  'Évangélisation',
  'Nettoyage',
  'Groupe de prière',
  'Chorale',
  'Groupe musical',
  'Encadrement des âmes',
  'Comité social',
  'Moniteur Ecodim',
  'Scout',
  'Comité logistique',
];

export const WELCOME_CONTEXT_OPTIONS: WelcomeContextType[] = [
  'Culte',
  'Réunion du soir',
  "Campagne d'évangélisation",
  "Semaine d'accentuation",
];

export const CLOSURE_REASONS: string[] = [
  'Âme intégrée et autonome',
  'Déménagement hors zone',
  "Déjà membre actif d'une autre assemblée",
  'Refus / Ne souhaite plus être suivi(e)',
  'Injoignable après plusieurs tentatives',
  'Autre',
];

export const CONTACT_FREQUENCIES: {
  value: ContactFrequency;
  label: string;
  monthlyScore: number;
}[] = [
  { value: '0/M', label: '0/M (Aucun ce mois)', monthlyScore: 0 },
  { value: '1/M', label: '1/M (1 fois / mois)', monthlyScore: 1 },
  { value: '2/M', label: '2/M (2 fois / mois)', monthlyScore: 2 },
  { value: '3/M', label: '3/M (3 fois / mois)', monthlyScore: 3 },
  { value: '1/S', label: '1/S (1 fois / semaine)', monthlyScore: 4 },
  { value: '2/S', label: '2/S (2 fois / semaine)', monthlyScore: 8 },
  { value: '3/S', label: '3/S (3 fois / semaine)', monthlyScore: 12 },
];

export const frequencyToMonthlyScore = (freq: ContactFrequency): number => {
  return CONTACT_FREQUENCIES.find((f) => f.value === freq)?.monthlyScore ?? 0;
};

export const PLEF_SCORE_LABELS: { value: number; label: string; description: string }[] = [
  { value: 0, label: '0 — Non entamé', description: 'Pratique non encore engagée' },
  { value: 1, label: '1 — Éveil', description: 'Premiers pas occasionnels' },
  { value: 2, label: '2 — Irrégulier', description: 'Engagement ponctuel à encourager' },
  { value: 3, label: '3 — Régulier', description: 'Rythme constant et encourageant' },
  { value: 4, label: '4 — Assidu', description: 'Discipline spirituelle affirmée' },
  { value: 5, label: '5 — Autonome', description: 'Maturité et exemple pour les autres' },
];

export const getGrowthEvaluationSummary = (p: number, l: number, e: number, f: number) => {
  const total = p + l + e + f; // Max 20
  if (total <= 4) {
    return { total, stage: 'Éveil spirituel', tone: 'slate' as const };
  }
  if (total <= 9) {
    return { total, stage: 'Enracinement', tone: 'amber' as const };
  }
  if (total <= 14) {
    return { total, stage: 'Affermissement', tone: 'indigo' as const };
  }
  return { total, stage: 'Maturité & Service', tone: 'emerald' as const };
};

export const DISCIPLESHIP_QUALITIES: DiscipleshipQuality[] = [
  'Nouveau',
  'Habitué',
  'Régulier',
  'Catéchumène',
  'Néophyte',
  'Intégré',
];

export const COURSE_STATUS_OPTIONS: CourseProgress[] = [
  'Non',
  'En cours',
  'Validé',
];

export const MONTHS_FR: { value: number; label: string; short: string }[] = [
  { value: 1, label: 'Janvier', short: 'Jan' },
  { value: 2, label: 'Février', short: 'Fév' },
  { value: 3, label: 'Mars', short: 'Mar' },
  { value: 4, label: 'Avril', short: 'Avr' },
  { value: 5, label: 'Mai', short: 'Mai' },
  { value: 6, label: 'Juin', short: 'Juin' },
  { value: 7, label: 'Juillet', short: 'Juil' },
  { value: 8, label: 'Août', short: 'Aoû' },
  { value: 9, label: 'Septembre', short: 'Sep' },
  { value: 10, label: 'Octobre', short: 'Oct' },
  { value: 11, label: 'Novembre', short: 'Nov' },
  { value: 12, label: 'Décembre', short: 'Déc' },
];
