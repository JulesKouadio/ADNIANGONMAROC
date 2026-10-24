export type SoulGender = 'HOMME' | 'FEMME' | 'JEUNE' | 'ENFANT';

export type FollowUpStatus = 'nouveau' | 'contacte' | 'visite' | 'integre';

export interface NewSoul {
  id: string;
  receptionDate: string; // YYYY-MM-DD
  gender: SoulGender;
  lastName: string;
  firstNames: string;
  neighborhood: string;
  addressLandmark: string;
  phoneNumber: string;
  prayerCell: string;
  canReceiveVisit: boolean;
  visitDay?: string;
  visitTime?: string;
  visitRefusalReason?: string;
  knowsSomeoneInChurch: boolean;
  knownPersonName?: string;
  recordedByName: string;
  recordedByPhone: string;
  observation: string;
  followUpStatus?: FollowUpStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrayerCell {
  id: string;
  name: string;
  neighborhood: string;
  leaderName: string;
  leaderPhone: string;
  meetingDay: string;
  meetingTime: string;
  description?: string;
}
