import type { User } from "../../user/types/user";
import apiClient from "../../../shared/utils/axios";

export const storeUserData = (user: User): void => {
  if (!user) {
    localStorage.removeItem('user');
    return;
  }
  localStorage.setItem('user', JSON.stringify(user));
};

export function getUserData(): User | null {
  const raw = localStorage.getItem("user");

  if (!raw || raw === "undefined" || raw === "null") {
    localStorage.removeItem("user");
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export const isAuthenticated = (): boolean => {
  return getUserData() !== null;
};

export const clearUserData = (): void => {
  localStorage.removeItem('user');
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/api/auth/logout');
  } catch {
  }
  clearUserData();
};

/**
 * Verify the current session by calling /api/auth/me.
 * If valid, updates localStorage with fresh user data.
 * If invalid (401), clears localStorage.
 * @returns The user if session is valid, null otherwise.
 */
export const verifySession = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get('/api/auth/me');
    const user = response.data as User;
    storeUserData(user);
    return user;
  } catch {
    clearUserData();
    return null;
  }
};