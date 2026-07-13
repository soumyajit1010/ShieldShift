import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      login: (token, user) =>
        set({
          isAuthenticated: true,
          token,
          user,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          user: null,
        }),

      updateUser: (user) =>
        set((state) => ({
          user: {
            ...state.user,
            ...user,
          },
        })),
    }),
    {
      name: "gigshield-auth", // localStorage key
    }
  )
);