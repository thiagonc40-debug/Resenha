import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Court {
  id: string;
  name: string;
  type: string; // e.g., 'Coberta Fut 7', 'Descoberta Premium', 'Arena VIP Society'
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

interface AppState {
  courts: Court[];
  settings: AppSettings;
  isAdminAuthenticated: boolean;
  addCourt: (court: Court) => void;
  updateCourt: (id: string, court: Partial<Court>) => void;
  removeCourt: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  loginAdmin: () => void;
  logoutAdmin: () => void;
}

const defaultCourts: Court[] = [
  {
    id: 'q1',
    name: 'Quadra 1',
    type: 'Coberta Fut 7',
    price: 190,
    features: ['Grama 52mm', '2 Câmeras de replay 4K'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRjWTbG2-zkHIw6zkaaBQTfWK9XCjt9InqDaYIEnvA1arEi3gdA06yPPthxiFVoGM26M5pW71u8r1WD1uV3AYFURoQZFdiE-C9gQX_9ghU4Ny3pBRYu9aFLa1eSS6V_TLN5uoBkxh5Zv6nvgheGkIA_NhKW_sMHJXE-8WAdNol5vx9OEKd4y2ER8E2HQrqnbe6MnVi9kCNpavw7dahltvLWWTbHIXVuDIY9fBwajf4zBwwfX4f82R3JA',
    isActive: true,
  },
  {
    id: 'q2',
    name: 'Quadra 2',
    type: 'Descoberta Premium',
    price: 160,
    features: ['Ventilação aberta', 'Drenagem rápida'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzw_g6KCeWe8AXAaoschcEvTnf6zIZpJj-eZh_HOIUcapqISlq9UeotFberMEyAn6mmjrqybzXugn3BwGA3K2nHDZZCbtysy_3gcUa9V_E1r0NMl8phd_aGBl6a38f09rl1XZG1TrkMb7Mov5gYPClUHHHEIjDw2ohUqra3ra3n86bDNsMOHIJulq6jEvr0YnFKOWvs_h5OS2ltYqCZb2_UtZO3A4LpBElkIp5eRetjdvbmJgp2M5A2Q',
    isActive: true,
  },
  {
    id: 'q3',
    name: 'Quadra 3',
    type: 'Arena VIP Society',
    price: 210,
    features: ['Acesso direto ao lounge de churrasqueira'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIfmEJqIiPziWkgK1z-slWoCvKbi_zeC5JtLThiyAZs_jJVPq6vrQ277Z6Ofs4y36K8wd1GSwWYrBLDpi290k0B61hVCgt24Jz-aUHpUVDRa-cFTMsa2ig0V0OIy3NSRt-BkpJS7RTrN_3WCI4OYi-MjRe3xYkDVgSUKeicVScx-UHBmEIwmcXPg5uUTX10YoN2a5iAS3axcAPVN4kWx8eye5vngA7trfX0MmRWfWWdAcakHWInay4xA',
    isActive: true,
  }
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      courts: defaultCourts,
      settings: {
        appName: 'Resenha Society',
        openTime: '06:00',
        closeTime: '00:00',
        pixKey: '00020126580014br.gov.bcb.pix0136resenhasociety',
        pixName: 'Resenha Society Ltda',
      },
      isAdminAuthenticated: false,
      
      addCourt: (court) => set((state) => ({ courts: [...state.courts, court] })),
      updateCourt: (id, updatedCourt) => set((state) => ({
        courts: state.courts.map(c => c.id === id ? { ...c, ...updatedCourt } : c)
      })),
      removeCourt: (id) => set((state) => ({
        courts: state.courts.filter(c => c.id !== id)
      })),
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      loginAdmin: () => set({ isAdminAuthenticated: true }),
      logoutAdmin: () => set({ isAdminAuthenticated: false }),
    }),
    {
      name: 'resenha-storage',
    }
  )
);
