import { create } from "zustand";

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  country: string | null;
  currency: string;
  language: string;
  timezone: string;
  avatarUrl: string | null;
  payday: number | null;
  accountStatus: string;
}

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
}));
