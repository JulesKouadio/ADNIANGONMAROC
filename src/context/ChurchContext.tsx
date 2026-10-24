import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType, 
  DEFAULT_PRAYER_CELLS 
} from '../firebase';
import { NewSoul, PrayerCell } from '../types';
import { INITIAL_SOULS_SEED } from '../data/seedData';
import { formatDateFr } from '../utils/date';

interface ChurchContextType {
  currentUser: User | null;
  authLoading: boolean;
  souls: NewSoul[];
  prayerCells: PrayerCell[];
  loadingSouls: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  addNewSoul: (data: Omit<NewSoul, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSoul: (id: string, data: Partial<NewSoul>) => Promise<void>;
  deleteSoul: (id: string) => Promise<void>;
  addPrayerCell: (cell: Omit<PrayerCell, 'id'>) => Promise<string>;
  deletePrayerCell: (id: string) => Promise<void>;
  exportToCsv: () => void;
  savedRecorder: { name: string; phone: string };
  setSavedRecorder: (rec: { name: string; phone: string }) => void;
}

const ChurchContext = createContext<ChurchContextType | null>(null);

const STORAGE_KEY_SOULS = 'moisson_nouvelles_ames_local_cache';
const STORAGE_KEY_CELLS = 'moisson_prayer_cells_local_cache';
const STORAGE_KEY_RECORDER = 'moisson_saved_recorder_info';

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [souls, setSouls] = useState<NewSoul[]>(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEY_SOULS);
      if (local) {
        const parsed: NewSoul[] = JSON.parse(local);
        return parsed.filter(s => !['soul_seed_1', 'soul_seed_2', 'soul_seed_3'].includes(s.id));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [prayerCells, setPrayerCells] = useState<PrayerCell[]>(() => {
    try {
      const local = localStorage.getItem(STORAGE_KEY_CELLS);
      if (local) {
        const parsed: PrayerCell[] = JSON.parse(local);
        return parsed.filter(c => !['cell_bethanie', 'cell_ebenezer', 'cell_siloe', 'cell_jeunesse'].includes(c.id));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [loadingSouls, setLoadingSouls] = useState(false);

  const [savedRecorder, setSavedRecorderState] = useState<{ name: string; phone: string }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDER);
      return saved ? JSON.parse(saved) : { name: '', phone: '' };
    } catch {
      return { name: '', phone: '' };
    }
  });

  const setSavedRecorder = (rec: { name: string; phone: string }) => {
    setSavedRecorderState(rec);
    try {
      localStorage.setItem(STORAGE_KEY_RECORDER, JSON.stringify(rec));
    } catch (e) {
      console.warn('Could not save recorder to local storage', e);
    }
  };

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user && user.displayName && !savedRecorder.name) {
        setSavedRecorder({
          name: user.displayName,
          phone: savedRecorder.phone || ''
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync prayer cells from Firestore (multi-user real-time)
  useEffect(() => {
    // Delete any old fictional cells from cloud
    const fictionalCellIds = ['cell_bethanie', 'cell_ebenezer', 'cell_siloe', 'cell_jeunesse'];
    fictionalCellIds.forEach(async (fId) => {
      try {
        await deleteDoc(doc(db, 'prayerCells', fId));
      } catch {}
    });

    const path = 'prayerCells';
    const unsub = onSnapshot(collection(db, path), (snapshot) => {
      const fetchedCells: PrayerCell[] = snapshot.docs
        .map(d => ({
          ...(d.data() as PrayerCell),
          id: d.id,
        }))
        .filter(c => !fictionalCellIds.includes(c.id));
      setPrayerCells(fetchedCells);
      try {
        localStorage.setItem(STORAGE_KEY_CELLS, JSON.stringify(fetchedCells));
      } catch {}
    }, (error) => {
      console.warn('PrayerCells Firestore snapshot notice:', error.message);
    });

    return () => unsub();
  }, []);

  // Sync souls from Firestore with live real-time multi-user collaboration
  useEffect(() => {
    setLoadingSouls(true);
    // Delete any old fictional souls from cloud
    const fictionalSoulIds = ['soul_seed_1', 'soul_seed_2', 'soul_seed_3'];
    fictionalSoulIds.forEach(async (sId) => {
      try {
        await deleteDoc(doc(db, 'newSouls', sId));
      } catch {}
    });

    const path = 'newSouls';
    const unsub = onSnapshot(collection(db, path), (snapshot) => {
      const fetchedSouls: NewSoul[] = snapshot.docs
        .map(d => ({
          ...(d.data() as NewSoul),
          id: d.id,
        }))
        .filter(s => !fictionalSoulIds.includes(s.id));
      // Sort by reception date descending
      fetchedSouls.sort((a, b) => new Date(b.receptionDate).getTime() - new Date(a.receptionDate).getTime());
      setSouls(fetchedSouls);
      try {
        localStorage.setItem(STORAGE_KEY_SOULS, JSON.stringify(fetchedSouls));
      } catch {}
      setLoadingSouls(false);
    }, (error) => {
      console.warn('Souls real-time sync notice:', error.message);
      setLoadingSouls(false);
    });

    return () => unsub();
  }, []);

  // Auth functions
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  // Soul mutations
  const addNewSoul = async (data: Omit<NewSoul, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const soulId = 'soul_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const nowIso = new Date().toISOString();
    const newSoulRecord: NewSoul = {
      ...data,
      id: soulId,
      followUpStatus: data.followUpStatus || 'nouveau',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Save to local state first for immediate UI responsiveness
    setSouls(prev => [newSoulRecord, ...prev]);
    try {
      const updated = [newSoulRecord, ...souls];
      localStorage.setItem(STORAGE_KEY_SOULS, JSON.stringify(updated));
    } catch {}

    // Save to Firestore
    const path = `newSouls/${soulId}`;
    try {
      await setDoc(doc(db, 'newSouls', soulId), newSoulRecord);
    } catch (error) {
      console.warn('Could not write directly to Firestore (may need login):', error);
      // In offline or restricted mode, it stays in local storage and will sync upon sign-in
    }

    return soulId;
  };

  const updateSoul = async (id: string, data: Partial<NewSoul>) => {
    const nowIso = new Date().toISOString();
    setSouls(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: nowIso } : s));
    try {
      const currentList = souls.map(s => s.id === id ? { ...s, ...data, updatedAt: nowIso } : s);
      localStorage.setItem(STORAGE_KEY_SOULS, JSON.stringify(currentList));
    } catch {}

    const path = `newSouls/${id}`;
    try {
      await updateDoc(doc(db, 'newSouls', id), {
        ...data,
        updatedAt: nowIso
      });
    } catch (error) {
      console.warn('Could not update Firestore document:', error);
    }
  };

  const deleteSoul = async (id: string) => {
    setSouls(prev => prev.filter(s => s.id !== id));
    try {
      const currentList = souls.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY_SOULS, JSON.stringify(currentList));
    } catch {}

    try {
      await deleteDoc(doc(db, 'newSouls', id));
    } catch (error) {
      console.warn('Could not delete in Firestore:', error);
    }
  };

  const addPrayerCell = async (cell: Omit<PrayerCell, 'id'>): Promise<string> => {
    const cellId = 'cell_' + Date.now();
    const newCell: PrayerCell = {
      ...cell,
      id: cellId,
    };

    setPrayerCells(prev => [...prev, newCell]);
    try {
      localStorage.setItem(STORAGE_KEY_CELLS, JSON.stringify([...prayerCells, newCell]));
    } catch {}

    try {
      await setDoc(doc(db, 'prayerCells', cellId), newCell);
    } catch (error) {
      console.warn('Could not save cell to Firestore:', error);
    }
    return cellId;
  };

  const deletePrayerCell = async (id: string) => {
    setPrayerCells(prev => prev.filter(c => c.id !== id));
    try {
      localStorage.setItem(STORAGE_KEY_CELLS, JSON.stringify(prayerCells.filter(c => c.id !== id)));
    } catch {}

    try {
      await deleteDoc(doc(db, 'prayerCells', id));
    } catch (error) {
      console.warn('Could not delete cell in Firestore:', error);
    }
  };

  const exportToCsv = () => {
    if (souls.length === 0) {
      alert("Aucune fiche de nouvelle âme à exporter.");
      return;
    }

    const headers = [
      "Date de réception",
      "Genre",
      "Nom",
      "Prénoms",
      "Téléphone",
      "Quartier d'habitation",
      "Repère",
      "Cellule de prière confiée",
      "Peut recevoir visite",
      "Jour de visite souhaité",
      "Heure de visite souhaitée",
      "Motif si refus visite",
      "Connaît quelqu'un dans l'église",
      "Nom de la connaissance",
      "Enregistré par (Nom)",
      "Enregistré par (Téléphone)",
      "Statut de suivi",
      "Observation"
    ];

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = souls.map(s => [
      escapeCsv(formatDateFr(s.receptionDate)),
      escapeCsv(s.gender),
      escapeCsv(s.lastName),
      escapeCsv(s.firstNames),
      escapeCsv(s.phoneNumber),
      escapeCsv(s.neighborhood),
      escapeCsv(s.addressLandmark),
      escapeCsv(s.prayerCell),
      escapeCsv(s.canReceiveVisit ? 'OUI' : 'NON'),
      escapeCsv(s.visitDay || '-'),
      escapeCsv(s.visitTime || '-'),
      escapeCsv(s.visitRefusalReason || '-'),
      escapeCsv(s.knowsSomeoneInChurch ? 'OUI' : 'NON'),
      escapeCsv(s.knownPersonName || '-'),
      escapeCsv(s.recordedByName),
      escapeCsv(s.recordedByPhone),
      escapeCsv(s.followUpStatus || 'nouveau'),
      escapeCsv(s.observation || '-')
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nouvelles_ames_eglise_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ChurchContext.Provider
      value={{
        currentUser,
        authLoading,
        souls,
        prayerCells,
        loadingSouls,
        loginWithGoogle,
        logout,
        addNewSoul,
        updateSoul,
        deleteSoul,
        addPrayerCell,
        deletePrayerCell,
        exportToCsv,
        savedRecorder,
        setSavedRecorder,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return context;
};
