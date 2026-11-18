import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  AccountRole,
  AccompanimentTeam,
  DiscipleshipInfo,
  FollowUpState,
  HostSubRole,
  HostUser,
  MonthlyFollowUp,
  NewSoul,
} from '../types';
import {
  formatDateFr,
  formatLongDateFr,
  formatShortDateFr,
  parseDateTimestamp,
} from '../utils/date';
import { hashPassword, normalizePhone } from '../utils/crypto';

const SESSION_HOST_ID_KEY = 'ad_niangon_maroc_session_host_id';

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        result[key] = stripUndefined(val);
      } else {
        result[key] = val;
      }
    }
  });
  return result as T;
}

function normalizeLegacySoul(raw: any, id: string): NewSoul {
  const nowShort = formatShortDateFr(new Date());
  const defaultDiscipolat: DiscipleshipInfo = {
    status: 'En attente',
    quality: 'Nouveau',
    basicCourse: 'Non',
    catechism: 'Non',
    isBaptized: false,
  };

  return {
    id,
    accueilMode: raw.accueilMode === 'express' || raw.accueilMode === 'long' ? raw.accueilMode : 'long',
    welcomeContextType: raw.welcomeContextType || 'Culte',
    welcomeMeetingDay: raw.welcomeMeetingDay || '',
    receptionDate: raw.receptionDate || nowShort,
    gender: raw.gender,
    lastName: raw.lastName || '',
    firstNames: raw.firstNames || '',
    phoneNumber: raw.phoneNumber || '',
    normalizedPhone: raw.normalizedPhone || normalizePhone(raw.phoneNumber || ''),
    commune: raw.commune || 'Yopougon',
    quartier: raw.quartier || raw.neighborhood || 'Maroc',
    secteur: raw.secteur || raw.neighborhood || 'Maroc Antenne',
    addressLandmark: raw.addressLandmark || '',
    gps: raw.gps || '',
    stayDuration: raw.stayDuration || 'Permanent',
    canReceiveVisit: raw.canReceiveVisit !== undefined ? Boolean(raw.canReceiveVisit) : true,
    visitDay: raw.visitDay || '',
    visitTime: raw.visitTime || '',
    visitRefusalReason: raw.visitRefusalReason || '',
    arrivalContext: raw.arrivalContext || 'Librement',
    arrivalSubContext: raw.arrivalSubContext || '',
    arrivalReferrerName: raw.arrivalReferrerName || raw.knownPersonName || '',
    isChristian: raw.isChristian !== undefined ? Boolean(raw.isChristian) : false,
    isAssemblyMember: raw.isAssemblyMember,
    isBaptized: raw.isBaptized,
    isActiveInDepartment: raw.isActiveInDepartment,
    consentToContact: raw.consentToContact !== undefined ? Boolean(raw.consentToContact) : true,
    consentToContactDateLong: raw.consentToContactDateLong || formatLongDateFr(raw.createdAt || new Date()),
    consentToRecord: raw.consentToRecord !== undefined ? Boolean(raw.consentToRecord) : true,
    recordedById: raw.recordedById || '',
    recordedByName: raw.recordedByName || 'Hôte d\'accueil',
    recordedByPhone: raw.recordedByPhone || '',
    observation: raw.observation || '',
    assignedTeamId: raw.assignedTeamId || '',
    assignedTeamName: raw.assignedTeamName || raw.prayerCell || '',
    assignedAccompagnateurId: raw.assignedAccompagnateurId || '',
    assignedAccompagnateurName: raw.assignedAccompagnateurName || '',
    followUpState: raw.followUpState || (raw.followUpStatus ? 'ouvert' : 'en_attente_decision'),
    closureReason: raw.closureReason || '',
    closureReasonOther: raw.closureReasonOther || '',
    closedByName: raw.closedByName || '',
    closedAtDateLong: raw.closedAtDateLong || '',
    openedByName: raw.openedByName || '',
    openedAtDateLong: raw.openedAtDateLong || '',
    discipolat: raw.discipolat ? { ...defaultDiscipolat, ...raw.discipolat } : defaultDiscipolat,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

interface ChurchContextType {
  hosts: HostUser[];
  teams: AccompanimentTeam[];
  souls: NewSoul[];
  followUps: MonthlyFollowUp[];
  currentHost: HostUser | null;
  loading: boolean;
  syncError: string | null;
  clearSyncError: () => void;

  // Auth
  checkLoginStatus: (username: string) => {
    exists: boolean;
    mustSetPassword: boolean;
    suspended: boolean;
    fullName?: string;
    subRole?: string;
  };
  setupFirstPassword: (username: string, newPassword: string) => Promise<HostUser>;
  login: (username: string, password: string) => Promise<HostUser>;
  logout: () => void;

  // Host & Team mutations
  createHost: (input: {
    username: string;
    password: string;
    lastName: string;
    firstNames: string;
    phone: string;
    location: string;
    role: AccountRole;
    subRole: HostSubRole;
    teamId?: string;
  }) => Promise<string>;
  updateHost: (
    hostId: string,
    updates: Partial<Omit<HostUser, 'id' | 'createdAt'>> & { newPassword?: string }
  ) => Promise<void>;
  transferPrincipalAuthority: (targetHostId: string) => Promise<void>;
  createTeam: (name: string, leaderId: string) => Promise<string>;
  updateTeam: (
    teamId: string,
    updates: { name?: string; leaderId?: string; status?: 'active' | 'suspended' }
  ) => Promise<void>;

  // Soul mutations
  findSoulByPhone: (phone: string, excludeSoulId?: string) => NewSoul | undefined;
  addNewSoul: (
    data: Omit<NewSoul, 'id' | 'createdAt' | 'updatedAt' | 'normalizedPhone' | 'followUpState'>
  ) => Promise<string>;
  updateSoul: (id: string, data: Partial<NewSoul>) => Promise<void>;
  deleteSoul: (id: string) => Promise<void>;
  assignSoulToTeam: (soulId: string, teamId: string) => Promise<void>;
  assignSoulToAccompagnateur: (soulId: string, hostId: string) => Promise<void>;
  openSoulFollowUp: (soulId: string) => Promise<void>;
  closeSoulFollowUp: (soulId: string, reason: string, reasonOther?: string) => Promise<void>;
  updateSoulDiscipleship: (soulId: string, discipolat: DiscipleshipInfo) => Promise<void>;

  // Monthly follow-up mutations (PLEF, REX, Reports)
  upsertMonthlyFollowUp: (
    data: Omit<MonthlyFollowUp, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => Promise<string>;
  deleteMonthlyFollowUp: (id: string) => Promise<void>;

  // Export
  exportSoulsToCsv: (list?: NewSoul[]) => void;
}

const ChurchContext = createContext<ChurchContextType | null>(null);

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hosts, setHosts] = useState<HostUser[]>([]);
  const [teams, setTeams] = useState<AccompanimentTeam[]>([]);
  const [souls, setSouls] = useState<NewSoul[]>([]);
  const [followUps, setFollowUps] = useState<MonthlyFollowUp[]>([]);

  const [hostsLoaded, setHostsLoaded] = useState(false);
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [soulsLoaded, setSoulsLoaded] = useState(false);
  const [followUpsLoaded, setFollowUpsLoaded] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [loggedHostId, setLoggedHostId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_HOST_ID_KEY);
    } catch {
      return null;
    }
  });

  // Sync hosts & bootstrap first Responsable principal (JOEL GAMI / 0709411980) if empty
  useEffect(() => {
    let bootstrapped = false;
    const unsub = onSnapshot(
      collection(db, 'hosts'),
      async (snapshot) => {
        const fetched: HostUser[] = snapshot.docs.map((d) => ({
          ...(d.data() as HostUser),
          id: d.id,
        }));

        if (fetched.length === 0 && !bootstrapped) {
          bootstrapped = true;
          const nowIso = new Date().toISOString();
          const initialPwHash = await hashPassword('0709411980');
          const initialPrincipal: HostUser = {
            id: 'host_responsable_principal_1',
            username: 'JOEL GAMI',
            passwordHash: initialPwHash,
            mustSetPassword: false,
            lastName: 'GAMI',
            firstNames: 'JOEL',
            phone: '0709411980',
            location: 'Yopougon Maroc',
            role: 'Responsable',
            subRole: 'Responsable principal',
            teamId: '',
            teamName: '',
            status: 'active',
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          try {
            await setDoc(doc(db, 'hosts', initialPrincipal.id), stripUndefined(initialPrincipal));
            setHosts([initialPrincipal]);
            setHostsLoaded(true);
            return;
          } catch (err) {
            setSyncError("Impossible d'initialiser le premier responsable dans Firebase.");
            console.error(err);
          }
        } else {
          const legacyPrincipal = fetched.find(
            (h) =>
              h.id === 'host_responsable_principal_1' &&
              h.username === '0709411980' &&
              h.mustSetPassword === true &&
              !h.passwordHash
          );
          if (legacyPrincipal && !bootstrapped) {
            bootstrapped = true;
            const initialPwHash = await hashPassword('0709411980');
            try {
              await updateDoc(doc(db, 'hosts', legacyPrincipal.id), {
                username: 'JOEL GAMI',
                passwordHash: initialPwHash,
                mustSetPassword: false,
                updatedAt: new Date().toISOString(),
              });
              return;
            } catch (err) {
              console.error('Migration initial principal error:', err);
            }
          }
        }

        fetched.sort((a, b) => a.lastName.localeCompare(b.lastName));
        setHosts(fetched);
        setHostsLoaded(true);
      },
      (error) => {
        setSyncError(`Erreur de synchronisation Firebase (Hôtes) : ${error.message}`);
        setHostsLoaded(true);
      }
    );
    return () => unsub();
  }, []);

  // Sync teams
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        const fetched: AccompanimentTeam[] = snapshot.docs.map((d) => ({
          ...(d.data() as AccompanimentTeam),
          id: d.id,
        }));
        fetched.sort((a, b) => a.name.localeCompare(b.name));
        setTeams(fetched);
        setTeamsLoaded(true);
      },
      (error) => {
        setSyncError(`Erreur de synchronisation Firebase (Équipes) : ${error.message}`);
        setTeamsLoaded(true);
      }
    );
    return () => unsub();
  }, []);

  // Sync newSouls
  useEffect(() => {
    const fictionalSoulIds = ['soul_seed_1', 'soul_seed_2', 'soul_seed_3'];
    const unsub = onSnapshot(
      collection(db, 'newSouls'),
      (snapshot) => {
        const fetched: NewSoul[] = snapshot.docs
          .filter((d) => !fictionalSoulIds.includes(d.id))
          .map((d) => normalizeLegacySoul(d.data(), d.id));
        fetched.sort(
          (a, b) =>
            parseDateTimestamp(b.receptionDate || b.createdAt) -
            parseDateTimestamp(a.receptionDate || a.createdAt)
        );
        setSouls(fetched);
        setSoulsLoaded(true);
      },
      (error) => {
        setSyncError(`Erreur de synchronisation Firebase (Âmes) : ${error.message}`);
        setSoulsLoaded(true);
      }
    );
    return () => unsub();
  }, []);

  // Sync monthly follow-ups
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'followUps'),
      (snapshot) => {
        const fetched: MonthlyFollowUp[] = snapshot.docs.map((d) => ({
          ...(d.data() as MonthlyFollowUp),
          id: d.id,
        }));
        fetched.sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.month - a.month;
        });
        setFollowUps(fetched);
        setFollowUpsLoaded(true);
      },
      (error) => {
        setSyncError(`Erreur de synchronisation Firebase (Suivis mensuels) : ${error.message}`);
        setFollowUpsLoaded(true);
      }
    );
    return () => unsub();
  }, []);

  const currentHost = useMemo(() => {
    if (!loggedHostId) return null;
    const found = hosts.find((h) => h.id === loggedHostId);
    if (!found || found.status === 'suspended') {
      return null;
    }
    return found;
  }, [hosts, loggedHostId]);

  // Auto clear invalid/suspended session once hosts loaded
  useEffect(() => {
    if (hostsLoaded && loggedHostId) {
      const found = hosts.find((h) => h.id === loggedHostId);
      if (!found || found.status === 'suspended') {
        setLoggedHostId(null);
        try {
          localStorage.removeItem(SESSION_HOST_ID_KEY);
        } catch {}
      }
    }
  }, [hostsLoaded, hosts, loggedHostId]);

  const loading = !(hostsLoaded && teamsLoaded && soulsLoaded && followUpsLoaded);

  const clearSyncError = () => setSyncError(null);

  // Auth helpers
  const checkLoginStatus = (username: string) => {
    const clean = username.trim().toLowerCase();
    const matched = hosts.find((h) => h.username.trim().toLowerCase() === clean);
    if (!matched) {
      return { exists: false, mustSetPassword: false, suspended: false };
    }
    return {
      exists: true,
      mustSetPassword: Boolean(matched.mustSetPassword),
      suspended: matched.status === 'suspended',
      fullName: `${matched.firstNames} ${matched.lastName}`,
      subRole: matched.subRole,
    };
  };

  const setupFirstPassword = async (username: string, newPassword: string): Promise<HostUser> => {
    const clean = username.trim().toLowerCase();
    const matched = hosts.find((h) => h.username.trim().toLowerCase() === clean);
    if (!matched) {
      throw new Error("Nom d'utilisateur introuvable.");
    }
    if (matched.status === 'suspended') {
      throw new Error('Ce compte est suspendu. Contactez un Responsable.');
    }
    if (newPassword.trim().length < 4) {
      throw new Error('Le mot de passe doit contenir au moins 4 caractères.');
    }

    const pwHash = await hashPassword(newPassword.trim());
    const nowIso = new Date().toISOString();
    const path = `hosts/${matched.id}`;
    try {
      await updateDoc(doc(db, 'hosts', matched.id), {
        passwordHash: pwHash,
        mustSetPassword: false,
        updatedAt: nowIso,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }

    setLoggedHostId(matched.id);
    localStorage.setItem(SESSION_HOST_ID_KEY, matched.id);
    return { ...matched, passwordHash: pwHash, mustSetPassword: false };
  };

  const login = async (username: string, password: string): Promise<HostUser> => {
    const normalizeUser = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
    const clean = normalizeUser(username);

    // Fetch live hosts from Firestore to ensure zero stale-cache mismatch
    let liveHosts = hosts;
    try {
      const snap = await getDocs(collection(db, 'hosts'));
      if (!snap.empty) {
        liveHosts = snap.docs.map((d) => ({ ...(d.data() as HostUser), id: d.id }));
        liveHosts.sort((a, b) => a.lastName.localeCompare(b.lastName));
        setHosts(liveHosts);
      }
    } catch (err) {
      console.warn('Could not refresh hosts during login, using cached snapshot:', err);
    }

    const matched = liveHosts.find((h) => normalizeUser(h.username) === clean);
    if (!matched) {
      throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
    }
    if (matched.status === 'suspended') {
      throw new Error('Votre compte est actuellement suspendu. Veuillez contacter le Responsable.');
    }

    const pwHash = await hashPassword(password.trim());
    if (pwHash !== matched.passwordHash) {
      throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
    }

    setLoggedHostId(matched.id);
    localStorage.setItem(SESSION_HOST_ID_KEY, matched.id);
    return matched;
  };

  const logout = () => {
    setLoggedHostId(null);
    try {
      localStorage.removeItem(SESSION_HOST_ID_KEY);
    } catch {}
  };

  // Host & Team mutations
  const createHost: ChurchContextType['createHost'] = async (input) => {
    const cleanUsername = input.username.trim();
    if (!cleanUsername) throw new Error("Le nom d'utilisateur est obligatoire.");
    if (hosts.some((h) => h.username.trim().toLowerCase() === cleanUsername.toLowerCase())) {
      throw new Error(`Le nom d'utilisateur "${cleanUsername}" est déjà utilisé.`);
    }
    if (input.password.trim().length < 4) {
      throw new Error('Le mot de passe doit comporter au moins 4 caractères.');
    }

    // Constraint: Only one Chef d'équipe per team
    if (input.role === "Chef d'équipe" && input.teamId) {
      const existingLeader = hosts.find(
        (h) => h.role === "Chef d'équipe" && h.teamId === input.teamId && h.status === 'active'
      );
      if (existingLeader) {
        throw new Error(
          `Cette équipe possède déjà un Chef d'équipe (${existingLeader.firstNames} ${existingLeader.lastName}).`
        );
      }
    }

    const selectedTeam = input.teamId ? teams.find((t) => t.id === input.teamId) : undefined;
    const hostId = 'host_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const nowIso = new Date().toISOString();
    const pwHash = await hashPassword(input.password.trim());

    const payload: HostUser = stripUndefined({
      id: hostId,
      username: cleanUsername,
      passwordHash: pwHash,
      mustSetPassword: false,
      lastName: input.lastName.trim().toUpperCase(),
      firstNames: input.firstNames.trim(),
      phone: input.phone.trim(),
      location: input.location.trim(),
      role: input.role,
      subRole: input.subRole,
      teamId: selectedTeam?.id || '',
      teamName: selectedTeam?.name || '',
      status: 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    try {
      await setDoc(doc(db, 'hosts', hostId), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `hosts/${hostId}`);
    }
    return hostId;
  };

  const updateHost: ChurchContextType['updateHost'] = async (hostId, updates) => {
    const target = hosts.find((h) => h.id === hostId);
    if (!target) throw new Error('Hôte introuvable.');

    if (updates.username) {
      const duplicate = hosts.find(
        (h) => h.id !== hostId && h.username.trim().toLowerCase() === updates.username!.trim().toLowerCase()
      );
      if (duplicate) {
        throw new Error(`Le nom d'utilisateur "${updates.username}" est déjà pris.`);
      }
    }

    const nextRole = updates.role || target.role;
    const nextTeamId = updates.teamId !== undefined ? updates.teamId : target.teamId;

    if (nextRole === "Chef d'équipe" && nextTeamId) {
      const teamAlreadyHasOtherLeader = teams.find(
        (t) => t.id === nextTeamId && t.leaderId && t.leaderId !== hostId
      );
      if (teamAlreadyHasOtherLeader) {
        throw new Error(
          `L'équipe "${teamAlreadyHasOtherLeader.name}" est déjà dirigée par ${teamAlreadyHasOtherLeader.leaderName}.`
        );
      }
    }

    const nowIso = new Date().toISOString();
    const nextTeam = nextTeamId ? teams.find((t) => t.id === nextTeamId) : undefined;
    const merged: Record<string, any> = {
      ...target,
      ...updates,
      teamId: nextTeamId || '',
      teamName: nextTeam ? nextTeam.name : updates.teamName !== undefined ? updates.teamName : target.teamName || '',
      updatedAt: nowIso,
    };
    delete merged.newPassword;

    if (updates.newPassword && updates.newPassword.trim().length > 0) {
      if (updates.newPassword.trim().length < 4) {
        throw new Error('Le nouveau mot de passe doit contenir au moins 4 caractères.');
      }
      merged.passwordHash = await hashPassword(updates.newPassword.trim());
      merged.mustSetPassword = false;
    }

    try {
      await setDoc(doc(db, 'hosts', hostId), stripUndefined(merged));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `hosts/${hostId}`);
    }
  };

  const transferPrincipalAuthority = async (targetHostId: string) => {
    const currentPrincipal = hosts.find((h) => h.subRole === 'Responsable principal');
    const target = hosts.find((h) => h.id === targetHostId);
    if (!target) throw new Error("Hôte cible introuvable.");
    if (target.status === 'suspended') {
      throw new Error("Impossible de léguer l'autorité à un compte suspendu.");
    }
    const nowIso = new Date().toISOString();

    if (currentPrincipal && currentPrincipal.id !== targetHostId) {
      await setDoc(
        doc(db, 'hosts', currentPrincipal.id),
        stripUndefined({
          ...currentPrincipal,
          role: 'Responsable',
          subRole: 'Responsable adjoint',
          updatedAt: nowIso,
        })
      );
    }

    await setDoc(
      doc(db, 'hosts', target.id),
      stripUndefined({
        ...target,
        role: 'Responsable',
        subRole: 'Responsable principal',
        updatedAt: nowIso,
      })
    );
  };

  const createTeam = async (name: string, leaderId: string): Promise<string> => {
    const cleanName = name.trim();
    if (!cleanName) throw new Error("Le nom de l'équipe est obligatoire.");
    const leader = hosts.find((h) => h.id === leaderId);
    if (!leader || leader.role !== "Chef d'équipe") {
      throw new Error("Vous devez sélectionner un hôte ayant le profil « Chef d'équipe ».");
    }
    if (leader.status === 'suspended') {
      throw new Error("Ce Chef d'équipe est suspendu.");
    }
    const alreadyLeading = teams.find((t) => t.leaderId === leaderId);
    if (alreadyLeading) {
      throw new Error(
        `Ce Chef d'équipe dirige déjà l'équipe "${alreadyLeading.name}". Un Chef d'équipe ne peut pas être assigné à plus d'une équipe.`
      );
    }

    const teamId = 'team_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const nowIso = new Date().toISOString();
    const teamPayload: AccompanimentTeam = stripUndefined({
      id: teamId,
      name: cleanName,
      leaderId: leader.id,
      leaderName: `${leader.firstNames} ${leader.lastName}`,
      leaderPhone: leader.phone,
      status: 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    try {
      await setDoc(doc(db, 'teams', teamId), teamPayload);
      await updateDoc(doc(db, 'hosts', leader.id), {
        teamId,
        teamName: cleanName,
        updatedAt: nowIso,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `teams/${teamId}`);
    }
    return teamId;
  };

  const updateTeam: ChurchContextType['updateTeam'] = async (teamId, updates) => {
    const existing = teams.find((t) => t.id === teamId);
    if (!existing) throw new Error("Équipe introuvable.");

    const nextLeaderId = updates.leaderId ?? existing.leaderId;
    const nextLeader = hosts.find((h) => h.id === nextLeaderId);
    if (!nextLeader || nextLeader.role !== "Chef d'équipe") {
      throw new Error("Le responsable d'équipe doit avoir le profil « Chef d'équipe ».");
    }
    const otherTeamLed = teams.find((t) => t.id !== teamId && t.leaderId === nextLeaderId);
    if (otherTeamLed) {
      throw new Error(
        `Ce Chef d'équipe dirige déjà "${otherTeamLed.name}". Un Chef d'équipe ne peut diriger qu'une seule équipe.`
      );
    }

    const nowIso = new Date().toISOString();
    const nextTeam: AccompanimentTeam = stripUndefined({
      ...existing,
      name: updates.name !== undefined ? updates.name.trim() : existing.name,
      leaderId: nextLeader.id,
      leaderName: `${nextLeader.firstNames} ${nextLeader.lastName}`,
      leaderPhone: nextLeader.phone,
      status: updates.status ?? existing.status,
      updatedAt: nowIso,
    });

    try {
      await setDoc(doc(db, 'teams', teamId), nextTeam);

      if (existing.leaderId !== nextLeader.id) {
        const oldLeader = hosts.find((h) => h.id === existing.leaderId);
        if (oldLeader) {
          await updateDoc(doc(db, 'hosts', oldLeader.id), {
            teamId: '',
            teamName: '',
            updatedAt: nowIso,
          });
        }
      }

      await updateDoc(doc(db, 'hosts', nextLeader.id), {
        teamId,
        teamName: nextTeam.name,
        updatedAt: nowIso,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `teams/${teamId}`);
    }
  };

  // Soul methods
  const findSoulByPhone = (phone: string, excludeSoulId?: string) => {
    const norm = normalizePhone(phone);
    if (!norm) return undefined;
    return souls.find((s) => s.id !== excludeSoulId && s.normalizedPhone === norm);
  };

  const addNewSoul: ChurchContextType['addNewSoul'] = async (data) => {
    const normPhone = normalizePhone(data.phoneNumber);
    if (!normPhone) throw new Error('Le numéro de téléphone est obligatoire.');
    const existingDuplicate = findSoulByPhone(data.phoneNumber);
    if (existingDuplicate) {
      throw new Error(
        `Une fiche existe déjà pour le numéro ${data.phoneNumber} (${existingDuplicate.firstNames} ${existingDuplicate.lastName}).`
      );
    }

    const soulId = 'soul_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const nowIso = new Date().toISOString();

    const payload: NewSoul = stripUndefined({
      ...data,
      id: soulId,
      normalizedPhone: normPhone,
      followUpState: 'en_attente_decision',
      discipolat: data.discipolat || {
        status: 'En attente',
        quality: 'Nouveau',
        basicCourse: 'Non',
        catechism: 'Non',
        isBaptized: false,
      },
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    try {
      await setDoc(doc(db, 'newSouls', soulId), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `newSouls/${soulId}`);
    }
    return soulId;
  };

  const updateSoul = async (id: string, updates: Partial<NewSoul>) => {
    const existing = souls.find((s) => s.id === id);
    if (!existing) throw new Error("Fiche d'âme introuvable.");

    if (updates.phoneNumber) {
      const dup = findSoulByPhone(updates.phoneNumber, id);
      if (dup) {
        throw new Error(
          `Ce numéro appartient déjà à ${dup.firstNames} ${dup.lastName}.`
        );
      }
    }

    const nowIso = new Date().toISOString();
    const merged: NewSoul = stripUndefined({
      ...existing,
      ...updates,
      normalizedPhone: updates.phoneNumber
        ? normalizePhone(updates.phoneNumber)
        : existing.normalizedPhone,
      updatedAt: nowIso,
    });

    try {
      await setDoc(doc(db, 'newSouls', id), merged);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `newSouls/${id}`);
    }
  };

  const deleteSoul = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'newSouls', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `newSouls/${id}`);
    }
  };

  const assignSoulToTeam = async (soulId: string, teamId: string) => {
    if (!currentHost || currentHost.role !== 'Responsable') {
      throw new Error("Seul un Responsable peut assigner une âme à une équipe.");
    }
    const team = teams.find((t) => t.id === teamId);
    await updateSoul(soulId, {
      assignedTeamId: team?.id || '',
      assignedTeamName: team?.name || '',
      // Reset accompagnateur if team changed and previous accompagnateur is not in new team
      assignedAccompagnateurId: '',
      assignedAccompagnateurName: '',
    });
  };

  const assignSoulToAccompagnateur = async (soulId: string, hostId: string) => {
    if (!currentHost) throw new Error('Non connecté.');
    const targetHost = hosts.find((h) => h.id === hostId);
    if (!targetHost) throw new Error('Accompagnateur introuvable.');

    if (currentHost.role === "Chef d'équipe") {
      if (targetHost.id !== currentHost.id && targetHost.teamId !== currentHost.teamId) {
        throw new Error(
          "Un Chef d'équipe ne peut assigner une âme qu'à un Accompagnateur de son équipe ou à lui-même."
        );
      }
    } else if (currentHost.role !== 'Responsable') {
      throw new Error("Droits insuffisants pour assigner une âme.");
    }

    const team = targetHost.teamId ? teams.find((t) => t.id === targetHost.teamId) : undefined;
    await updateSoul(soulId, {
      assignedTeamId: team?.id || currentHost.teamId || '',
      assignedTeamName: team?.name || currentHost.teamName || '',
      assignedAccompagnateurId: targetHost.id,
      assignedAccompagnateurName: `${targetHost.firstNames} ${targetHost.lastName}`,
    });
  };

  const openSoulFollowUp = async (soulId: string) => {
    if (!currentHost || currentHost.role !== 'Responsable') {
      throw new Error("L'ouverture du suivi est réservée uniquement au profil Responsable.");
    }
    await updateSoul(soulId, {
      followUpState: 'ouvert',
      openedByName: `${currentHost.firstNames} ${currentHost.lastName}`,
      openedAtDateLong: formatLongDateFr(new Date()),
    });
  };

  const closeSoulFollowUp = async (soulId: string, reason: string, reasonOther?: string) => {
    if (!currentHost || currentHost.role !== 'Responsable') {
      throw new Error("La fermeture du suivi est réservée uniquement au profil Responsable.");
    }
    const soul = souls.find((s) => s.id === soulId);
    if (!soul) throw new Error('Âme introuvable.');
    if (soul.accueilMode !== 'long') {
      throw new Error(
        "Impossible de fermer ce dossier : l'Accueil long de l'enregistrement doit d'abord être complété."
      );
    }
    if (!reason.trim()) {
      throw new Error('Veuillez sélectionner un motif de fermeture.');
    }
    if (reason === 'Autre' && (!reasonOther || !reasonOther.trim())) {
      throw new Error('Veuillez préciser le motif de fermeture dans le champ prévu.');
    }

    await updateSoul(soulId, {
      followUpState: 'ferme',
      closureReason: reason,
      closureReasonOther: reason === 'Autre' ? reasonOther?.trim() : '',
      closedByName: `${currentHost.firstNames} ${currentHost.lastName}`,
      closedAtDateLong: formatLongDateFr(new Date()),
    });
  };

  const updateSoulDiscipleship = async (soulId: string, discipolat: DiscipleshipInfo) => {
    await updateSoul(soulId, { discipolat });
  };

  // Monthly follow-ups
  const upsertMonthlyFollowUp: ChurchContextType['upsertMonthlyFollowUp'] = async (data) => {
    const id = data.id || `fu_${data.soulId}_${data.year}_${data.month}`;
    const existing = followUps.find((f) => f.id === id);
    const nowIso = new Date().toISOString();

    const rexChanged = (data.rex || '').trim() !== (existing?.rex || '').trim();
    const hasRex = Boolean(data.rex && data.rex.trim());
    const reportChanged = (data.report || '').trim() !== (existing?.report || '').trim();
    const hasReport = Boolean(data.report && data.report.trim());

    const payload: MonthlyFollowUp = stripUndefined({
      ...data,
      id,
      rex: data.rex?.trim() || '',
      rexDateShort: hasRex
        ? rexChanged || !existing?.rexDateShort
          ? formatShortDateFr(new Date())
          : existing.rexDateShort
        : '',
      report: data.report?.trim() || '',
      reportUpdatedAt: hasReport
        ? reportChanged || !existing?.reportUpdatedAt
          ? nowIso
          : existing.reportUpdatedAt
        : '',
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    });

    try {
      await setDoc(doc(db, 'followUps', id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `followUps/${id}`);
    }
    return id;
  };

  const deleteMonthlyFollowUp = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'followUps', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `followUps/${id}`);
    }
  };

  const exportSoulsToCsv = (list: NewSoul[] = souls) => {
    if (list.length === 0) {
      return;
    }

    const headers = [
      'Mode Enregistrement',
      'Contexte Accueil',
      'Date Réception',
      'Genre',
      'Nom',
      'Prénoms',
      'Téléphone',
      'Commune',
      'Quartier',
      'Secteur',
      'Repère',
      'GPS',
      'Durée',
      'Contexte Arrivée',
      'Chrétien',
      'Membre',
      'Baptisé',
      'Actif Département',
      'Visite Possible',
      'Jour Visite',
      'Heure Visite',
      'Accord Contact (Date longue)',
      'Équipe Assignée',
      'Accompagnateur Assigné',
      'État Suivi',
      'Statut Discipolat',
      'Qualité Discipolat',
      'Cours de base',
      'Catéchisme',
      'Département',
      'Enregistré par',
      'Observation',
    ];

    const esc = (v: unknown) => {
      if (v === undefined || v === null || v === '') return '""';
      return `"${String(v).replace(/"/g, '""')}"`;
    };

    const rows = list.map((s) => [
      esc(s.accueilMode === 'long' ? 'Accueil long' : 'Accueil express'),
      esc(
        s.welcomeContextType +
          (s.welcomeMeetingDay ? ` (${s.welcomeMeetingDay})` : '')
      ),
      esc(s.receptionDate),
      esc(s.gender || '-'),
      esc(s.lastName),
      esc(s.firstNames),
      esc(s.phoneNumber),
      esc(s.commune),
      esc(s.quartier),
      esc(s.secteur),
      esc(s.addressLandmark || '-'),
      esc(s.gps || '-'),
      esc(s.stayDuration || '-'),
      esc(
        s.arrivalContext
          ? `${s.arrivalContext}${s.arrivalSubContext ? ` (${s.arrivalSubContext})` : ''}${
              s.arrivalReferrerName ? ` - ${s.arrivalReferrerName}` : ''
            }`
          : '-'
      ),
      esc(s.isChristian ? 'Oui' : 'Non'),
      esc(s.isAssemblyMember === undefined ? '-' : s.isAssemblyMember ? 'Oui' : 'Non'),
      esc(s.isBaptized === undefined ? '-' : s.isBaptized ? 'Oui' : 'Non'),
      esc(s.isActiveInDepartment === undefined ? '-' : s.isActiveInDepartment ? 'Oui' : 'Non'),
      esc(s.canReceiveVisit === undefined ? '-' : s.canReceiveVisit ? 'Oui' : 'Non'),
      esc(s.visitDay || '-'),
      esc(s.visitTime || '-'),
      esc(s.consentToContactDateLong),
      esc(s.assignedTeamName || 'Non assignée'),
      esc(s.assignedAccompagnateurName || 'Non assigné'),
      esc(s.followUpState),
      esc(s.discipolat?.status || 'En attente'),
      esc(s.discipolat?.quality || 'Nouveau'),
      esc(s.discipolat?.basicCourse || 'Non'),
      esc(s.discipolat?.catechism || 'Non'),
      esc(s.discipolat?.department || '-'),
      esc(s.recordedByName),
      esc(s.observation || '-'),
    ]);

    const csv = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `registre_ames_${formatDateFr(new Date()).replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <ChurchContext.Provider
      value={{
        hosts,
        teams,
        souls,
        followUps,
        currentHost,
        loading,
        syncError,
        clearSyncError,
        checkLoginStatus,
        setupFirstPassword,
        login,
        logout,
        createHost,
        updateHost,
        transferPrincipalAuthority,
        createTeam,
        updateTeam,
        findSoulByPhone,
        addNewSoul,
        updateSoul,
        deleteSoul,
        assignSoulToTeam,
        assignSoulToAccompagnateur,
        openSoulFollowUp,
        closeSoulFollowUp,
        updateSoulDiscipleship,
        upsertMonthlyFollowUp,
        deleteMonthlyFollowUp,
        exportSoulsToCsv,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const ctx = useContext(ChurchContext);
  if (!ctx) throw new Error('useChurch must be used within a ChurchProvider');
  return ctx;
};
