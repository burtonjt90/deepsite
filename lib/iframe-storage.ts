/**
 * Utility for handling storage in iframe contexts
 * Falls back to localStorage when cookies are blocked
 */

export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true; // If we can't access window.top, we're likely in an iframe
  }
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "deepsite-auth-token-fallback",
  USER_DATA: "deepsite-user-data-fallback",
} as const;

export const iframeStorage = {
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Failed to set localStorage item:", error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("Failed to get localStorage item:", error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to remove localStorage item:", error);
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.warn("Failed to clear localStorage items:", error);
    }
  },
};

export const storeAuthDataFallback = (accessToken: string, userData: any): void => {
  if (isInIframe()) {
    iframeStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    iframeStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }
};

export const getAuthDataFallback = (): { token: string | null; user: any | null } => {
  if (isInIframe()) {
    const token = iframeStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const userDataStr = iframeStorage.getItem(STORAGE_KEYS.USER_DATA);
    const user = userDataStr ? JSON.parse(userDataStr) : null;
    return { token, user };
  }
  return { token: null, user: null };
};

export const clearAuthDataFallback = (): void => {
  if (isInIframe()) {
    iframeStorage.clear();
  }
};
