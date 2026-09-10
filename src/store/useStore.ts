import { create } from 'zustand';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../firebase';

export interface Court {
  id: string;
  name: string;
  type: string;
  price: number;
  features: string[];
  imageUrl: string;
  isActive: boolean;
}

export interface AppSettings {
  appName: string;
  openTime: string;
  closeTime: string;
  pixKey: string;
  pixName: string;
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
  settings: AppSettings;
  adminUser: User | null;
  isAdminAuthenticated: boolean;
  addCourt: (court: Court) => Promise<void>;
  updateCourt: (id: string, court: Partial<Court>) => Promise<void>;
  removeCourt: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setAdminUser: (user: User | null) => void;
  initializeListeners: () => void;
}

const defaultSettings: AppSettings = {
  appName: 'Resenha Society',
  openTime: '06:00',
  closeTime: '00:00',
  pixKey: '00020126580014br.gov.bcb.pix0136resenhasociety',
  pixName: 'Resenha Society Ltda',
};

export const useStore = create<AppState>((set, get) => ({
  courts: [],
  settings: defaultSettings,
  adminUser: null,
  isAdminAuthenticated: false,

  setAdminUser: (user) => set({ adminUser: user, isAdminAuthenticated: !!user }),

  addCourt: async (court) => {
    try {
      await setDoc(doc(db, 'courts', court.id), court);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `courts/${court.id}`);
    }
  },

  updateCourt: async (id, updatedCourt) => {
    try {
      await updateDoc(doc(db, 'courts', id), updatedCourt);
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
      await updateDoc(doc(db, 'settings', 'global'), newSettings);
    } catch (error) {
      if (error instanceof Error && error.message.includes('No document to update')) {
        // Create if missing
        await setDoc(doc(db, 'settings', 'global'), { ...get().settings, ...newSettings });
      } else {
        handleFirestoreError(error, OperationType.UPDATE, 'settings/global');
      }
    }
  },

  initializeListeners: () => {
    // Auth Listener
    onAuthStateChanged(auth, (user) => {
      set({ adminUser: user, isAdminAuthenticated: !!user });
    });

    // Courts Listener
    onSnapshot(collection(db, 'courts'), (snapshot) => {
      const courtsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Court));
      set({ courts: courtsData });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courts');
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

