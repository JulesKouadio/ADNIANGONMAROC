export type AccountRole = 'Responsable' | "Chef d'équipe" | 'Accompagnateur';

export type HostSubRole =
  | 'Responsable principal'
  | 'Responsable adjoint'
  | "Chef d'équipe"
  | 'Accompagnateur';

export type UserStatus = 'active' | 'suspended';

export interface HostUser {
  id: string;
  username: string;
  passwordHash: string;
  mustSetPassword: boolean;
  lastName: string;
  firstNames: string;
  phone: string;
  location?: string;
  role: AccountRole;
  subRole: HostSubRole;
  teamId?: string;
  teamName?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AccompanimentTeam {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  leaderPhone?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type AccueilMode = 'express' | 'long';

export type WelcomeContextType =
  | 'Culte'
  | 'Réunion du soir'
  | "Campagne d'évangélisation"
  | "Semaine d'accentuation";

export type SoulGender = 'HOMME' | 'FEMME' | 'JEUNE' | 'ENFANT';

export type StayDuration = 'Permanent' | 'Provisoire';

export type ArrivalContextType = 'Membre' | 'Invitation' | 'Librement';

export type FollowUpState = 'en_attente_decision' | 'ouvert' | 'ferme';

export type DiscipleshipStatus = 'En attente' | '1er Contact';

export type DiscipleshipQuality =
  | 'Nouveau'
  | 'Habitué'
  | 'Régulier'
  | 'Catéchumène'
  | 'Néophyte'
  | 'Intégré';

export type CourseProgress = 'Non' | 'En cours' | 'Validé';

export type BaptismValidity = 'Invalide' | 'Valide';

export interface DiscipleshipInfo {
  status: DiscipleshipStatus;
  firstContactDateLong?: string;
  quality: DiscipleshipQuality;
  basicCourse: CourseProgress;
  catechism: CourseProgress;
  isBaptized: boolean;
  baptismValidity?: BaptismValidity;
  baptismDateShort?: string;
  hasRenewal?: boolean;
  renewalDateShort?: string;
  department?: string;
  departmentDateShort?: string;
}

export interface NewSoul {
  id: string;
  accueilMode: AccueilMode;
  welcomeContextType: WelcomeContextType;
  welcomeMeetingDay?: string; // Mardi / Jeudi si Réunion du soir
  receptionDate: string; // Date courte ex: Mardi 12/11/2026 ou DD/MM/YYYY
  gender?: SoulGender;
  lastName: string;
  firstNames: string;
  phoneNumber: string;
  normalizedPhone: string;
  commune: string;
  quartier: string;
  secteur: string;
  addressLandmark?: string; // Repère
  gps?: string;
  stayDuration?: StayDuration;
  // Visite à domicile (conservée selon demande)
  canReceiveVisit?: boolean;
  visitDay?: string;
  visitTime?: string;
  visitRefusalReason?: string;
  // Contexte d'arrivée (Accueil long)
  arrivalContext?: ArrivalContextType;
  arrivalSubContext?: string; // Recommandation / Sans recommandation / Annonce / Membre
  arrivalReferrerName?: string;
  // Vie spirituelle
  isChristian: boolean;
  isAssemblyMember?: boolean;
  isBaptized?: boolean;
  isActiveInDepartment?: boolean;
  // Consentements
  consentToContact: boolean;
  consentToContactDateLong: string;
  consentToRecord: boolean;
  // Enregistreur & Observation
  recordedById?: string;
  recordedByName: string;
  recordedByPhone?: string;
  observation?: string;
  // Assignation & Etat du suivi
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedAccompagnateurId?: string;
  assignedAccompagnateurName?: string;
  followUpState: FollowUpState;
  closureReason?: string;
  closureReasonOther?: string;
  closedByName?: string;
  closedAtDateLong?: string;
  openedByName?: string;
  openedAtDateLong?: string;
  // Discipulat
  discipulat?: DiscipleshipInfo;
  createdAt: string;
  updatedAt: string;
}

export type ContactFrequency = '0/M' | '1/M' | '2/M' | '3/M' | '1/S' | '2/S' | '3/S';

export interface MonthlyFollowUp {
  id: string;
  soulId: string;
  soulName: string;
  teamId?: string;
  teamName?: string;
  accompagnateurId: string;
  accompagnateurName: string;
  year: number;
  month: number; // 1 à 12
  contactFrequency: ContactFrequency;
  plefP: number; // 0 à 5
  plefL: number; // 0 à 5
  plefE: number; // 0 à 5
  plefF: number; // 0 à 5
  rex?: string;
  rexDateShort?: string;
  report?: string;
  reportUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
}
