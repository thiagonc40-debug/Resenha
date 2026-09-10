import { create } from 'zustand';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

export interface Court {
  id: string;
  name: string;
  type: string;
  price: number;
  features: string[];
  imageUrl: string;
  isActive: boolean;
}

export interface Reservation {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  createdAt: number;
}

export interface AppSettings {
  appName: string;
  openTime: string;
  closeTime: string;
  pixKey: string;
  pixName: string;
  whatsappNumber: string;
  operatingDays: number[];
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppState {
  courts: Court[];
  reservations: Reservation[];
  settings: AppSettings;
  adminUser: User | null;
  isAdminAuthenticated: boolean;
  addCourt: (court: Court) => Promise<void>;
  updateCourt: (id: string, court: Partial<Court>) => Promise<void>;
  removeCourt: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  addReservation: (reservation: Reservation) => Promise<void>;
  updateReservationStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled') => Promise<void>;
  removeReservation: (id: string) => Promise<void>;
  setAdminUser: (user: User | null) => void;
  initializeListeners: () => void;
  getAvailableSlots: (courtId: string, date: string) => string[];
  verifyAdminStatus: (user: User) => Promise<boolean>;
}

const defaultSettings: AppSettings = {
  appName: 'Resenha Society',
  openTime: '06:00',
  closeTime: '00:00',
  pixKey: '00020126580014br.gov.bcb.pix0136resenhasociety',
  pixName: 'Resenha Society Ltda',
  whatsappNumber: '5511999999999',
  operatingDays: [0, 1, 2, 3, 4, 5, 6],
};

export const useStore = create<AppState>((set, get) => ({
  courts: [],
  reservations: [],
  settings: defaultSettings,
  adminUser: null,
  isAdminAuthenticated: false,

  setAdminUser: (user) => set({ adminUser: user, isAdminAuthenticated: !!user }),

  verifyAdminStatus: async (user: User) => {
    if (!user) return false;
    
    // Check if it's the bootstrapped admin
    if (user.email === 'thiagonc40@gmail.com') {
      return true; // Note: Firestore rules strictly require email_verified == true for writes
    }

    try {
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      return adminDoc.exists();
    } catch (e) {
      console.warn("User is not an admin or lacks permission to read admins collection.", e);
      return false;
    }
  },

  getAvailableSlots: (courtId: string, date: string) => {
    const { settings, reservations } = get();
    const openHour = parseInt(settings.openTime.split(':')[0], 10);
    const closeHour = parseInt(settings.closeTime.split(':')[0], 10);
    
    // Generate all 1-hour slots from openTime to closeTime
    const allSlots: string[] = [];
    let currentHour = openHour;
    
    // Handle midnight wrap-around if closeTime is earlier than openTime (e.g. 06:00 to 00:00)
    const endHour = closeHour === 0 ? 24 : (closeHour < openHour ? closeHour + 24 : closeHour);
    
    while (currentHour < endHour) {
      const start = `${(currentHour % 24).toString().padStart(2, '0')}:00`;
      allSlots.push(start);
      currentHour++;
    }

    // Filter out slots that are already reserved (pending or confirmed)
    const bookedSlots = reservations
      .filter(r => r.courtId === courtId && r.date === date && r.status !== 'cancelled')
      .map(r => r.startTime);

    return allSlots.filter(slot => !bookedSlots.includes(slot));
  },

  addCourt: async (court) => {
    try {
      const { id, ...courtData } = court;
      await setDoc(doc(db, 'courts', id), courtData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `courts/${court.id}`);
    }
  },

  updateCourt: async (id, updatedCourt) => {
    try {
      const { id: _, ...courtData } = updatedCourt as any;
      await updateDoc(doc(db, 'courts', id), courtData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `courts/${id}`);
    }
  },

  removeCourt: async (id) => {
    try {
      await deleteDoc(doc(db, 'courts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courts/${id}`);
    }
  },

  updateSettings: async (newSettings) => {
    try {
      const fullSettings = { ...get().settings, ...newSettings };
      await setDoc(doc(db, 'settings', 'global'), fullSettings, { merge: true });
      // Update local state immediately for better UX
      set({ settings: fullSettings });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/global');
    }
  },

  addReservation: async (reservation) => {
    try {
      const { id, ...reservationData } = reservation;
      await setDoc(doc(db, 'reservations', id), reservationData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reservations/${reservation.id}`);
    }
  },

  updateReservationStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, 'reservations', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reservations/${id}`);
    }
  },

  removeReservation: async (id) => {
    try {
      await deleteDoc(doc(db, 'reservations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reservations/${id}`);
    }
  },

  initializeListeners: () => {
    // Auth Listener
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = await get().verifyAdminStatus(user);
        if (isAdmin) {
          set({ adminUser: user, isAdminAuthenticated: true });
        } else {
          // If a non-admin logs in, sign them out immediately
          await signOut(auth);
          set({ adminUser: null, isAdminAuthenticated: false });
          alert('Acesso negado: Este usuário não possui permissão de administrador.');
        }
      } else {
        set({ adminUser: null, isAdminAuthenticated: false });
      }
    });

    // Courts Listener
    onSnapshot(collection(db, 'courts'), (snapshot) => {
      const courtsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Court));
      set({ courts: courtsData });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courts');
    });

    // Reservations Listener
    onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const reservationsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reservation));
      set({ reservations: reservationsData });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reservations');
    });

    // Settings Listener
    onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        set({ settings: docSnap.data() as AppSettings });
      } else {
        // Initialize default settings in DB if not exist and user is admin
        const currentUser = auth.currentUser;
        if (currentUser) {
           setDoc(doc(db, 'settings', 'global'), defaultSettings).catch(e => console.error(e));
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
    });
  }
}));

