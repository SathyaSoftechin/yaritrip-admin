import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      // ✅ LOGIN
      login: (data) => {
        const { token, user } = data;
        set({ token, user });
      },

      // ✅ LOGOUT
      logout: () => {
        set({ token: null, user: null });
      },

      // 🔥 ADD THIS (CRITICAL FIX)
      setUser: (updatedData) =>
        set((state) => ({
          user: {
            ...state.user,     // keep existing data
            ...updatedData,    // update only changed fields
          },
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);