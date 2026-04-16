import {
  type LoginAdminInput,
  getStoredAdminToken,
  initializeAdminSession,
  loginAdmin,
  logoutAdmin,
} from "@/lib/authApi";
import { create } from "zustand";

export type AdminAuthStatus =
  | "checking"
  | "signing-in"
  | "authenticated"
  | "unauthenticated";

interface AdminUser {
  id: string;
  email: string;
}

interface AdminAuthStore {
  status: AdminAuthStatus;
  user: AdminUser | null;
  token: string | null;
  initAuth: () => Promise<void>;
  login: (input: LoginAdminInput) => Promise<void>;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  status: "checking",
  user: null,
  token: null,

  initAuth: async () => {
    const storedToken = getStoredAdminToken();

    if (!storedToken) {
      set({ status: "unauthenticated", user: null, token: null });
      return;
    }

    set({ status: "checking" });
    initializeAdminSession();
    
    // Token exists, consider user authenticated
    set({
      status: "authenticated",
      token: storedToken,
    });
  },

  login: async (input) => {
    set({ status: "signing-in" });

    try {
      const response = await loginAdmin(input);
      set({
        status: "authenticated",
        token: input.token,
        user: response.user,
      });
    } catch (error) {
      set({ status: "unauthenticated", user: null, token: null });
      throw error;
    }
  },

  logout: () => {
    logoutAdmin();
    set({ status: "unauthenticated", user: null, token: null });
  },
}));
