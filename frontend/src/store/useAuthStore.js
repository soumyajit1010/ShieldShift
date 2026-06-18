import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  login: (token, user) => set({ isAuthenticated: true, token, user }),
  logout: () => set({ isAuthenticated: false, user: null, token: null }),
  updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } }))
}));
