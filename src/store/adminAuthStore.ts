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
  displayName?: string;
}

interface AdminSession {
  token: string;
  displayName: string;
}

interface AdminAuthStore {
  status: AdminAuthStatus;
  user: AdminUser | null;
  token: string | null;
  session: AdminSession | null;
  initAuth: () => Promise<void>;
  login: (input: LoginAdminInput) => Promise<void>;
  logout: () => void;
  syncSessionProfile: (profile: {
    email: string;
    displayName?: string;
  }) => void;
}

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  status: "checking",
  user: null,
  token: null,
  session: null,

  initAuth: async () => {
    const storedToken = getStoredAdminToken();

    if (!storedToken) {
      set({
        status: "unauthenticated",
        user: null,
        token: null,
        session: null,
      });
      return;
    }

    set({ status: "checking" });
    initializeAdminSession();

    const storedEmail =
      typeof window !== "undefined" ? localStorage.getItem("adminEmail") : null;
    const storedDisplayName =
      typeof window !== "undefined"
        ? localStorage.getItem("adminDisplayName")
        : null;

    // Token exists, consider user authenticated
    set({
      status: "authenticated",
      token: storedToken,
      user: storedEmail
        ? {
            id: storedEmail,
            email: storedEmail,
            displayName: storedDisplayName || storedEmail,
          }
        : null,
      session: {
        token: storedToken,
        displayName: storedDisplayName || storedEmail || "Admin",
      },
    });
  },

  login: async (input) => {
    set({ status: "signing-in" });

    try {
      const response = await loginAdmin(input);
      set({
        status: "authenticated",
        token: response.token,
        user: response.user,
        session: {
          token: response.token,
          displayName:
            response.user.displayName || response.user.email || "Admin",
        },
      });
    } catch (error) {
      set({
        status: "unauthenticated",
        user: null,
        token: null,
        session: null,
      });
      throw error;
    }
  },

  logout: () => {
    logoutAdmin();
    set({ status: "unauthenticated", user: null, token: null, session: null });
  },

  syncSessionProfile: ({ email, displayName }) => {
    const nextDisplayName = displayName || email || "Admin";

    if (typeof window !== "undefined") {
      localStorage.setItem("adminEmail", email);
      localStorage.setItem("adminDisplayName", nextDisplayName);
    }

    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            email,
            displayName: nextDisplayName,
          }
        : state.user,
      session: state.session
        ? {
            ...state.session,
            displayName: nextDisplayName,
          }
        : state.session,
    }));
  },
}));
