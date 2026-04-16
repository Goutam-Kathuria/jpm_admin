import { apiClient } from "@/api/apiClient";
import { ENDPOINTS } from "@/api/endpoint";

export interface LoginAdminInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
  message?: string;
}

export async function loginAdmin(input: LoginAdminInput) {
  try {
    // Login with email and password
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, {
      email: input.email,
      password: input.password,
    });

    // Store token in localStorage
    if (typeof window !== "undefined" && response.token) {
      localStorage.setItem("adminToken", response.token);
      localStorage.setItem("adminEmail", response.user.email);
    }

    // Set token for future API calls
    apiClient.setToken(response.token);

    return response;
  } catch (error) {
    apiClient.setToken(null);
    throw error;
  }
}

export function logoutAdmin() {
  apiClient.setToken(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminDisplayName");
  }
}

export function getStoredAdminToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("adminToken");
}

export function initializeAdminSession() {
  const token = getStoredAdminToken();
  if (token) {
    apiClient.setToken(token);
  }
}
