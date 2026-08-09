import { create } from "zustand";
import { workerApi } from "../services/api";

export const useDashboardStore = create((set) => ({

  dashboard: null,

  loading: false,

  fetchDashboard: async (workerId) => {

    try {

      set({ loading: true });

      const data = await workerApi.getDashboard(workerId);

      set({
        dashboard: data,
        loading: false,
      });

    } catch (error) {

      console.error("Failed to load dashboard", error);

      set({ loading: false });

    }

  },

  clearDashboard: () => {

    set({
      dashboard: null,
    });

  }

}));