// src/api/api.js

// Main backend URL from Vite env
const MAIN_API = import.meta.env.VITE_API_BASE;

// Backup backend URL from Vite env or fallback
const BACKUP_API = import.meta.env.VITE_BACKUP_API_BASE || "https://afribook.globelynks.com";

// Use main if available, otherwise backup
export const API_BASE = MAIN_API || BACKUP_API;

export const fetchWithToken = async (url, token, options = {}) => {
  try {
    const headers = {};

    // Only set JSON headers if NOT sending FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Add Authorization if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Prepend the API_BASE to relative URLs
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    // Handle no-content responses
    if (res.status === 204) return null;

    // Try parsing JSON
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}, message: ${data.error || data.message}`);
    }

    return data;
  } catch (err) {
    console.error("fetchWithToken ERROR:", err);

    // Optional: Retry with backup if MAIN_API fails
    if (MAIN_API && BACKUP_API && MAIN_API !== BACKUP_API) {
      try {
        const backupUrl = url.startsWith("http") ? url : `${BACKUP_API}${url}`;
        const backupRes = await fetch(backupUrl, {
          ...options,
          headers: {
            ...headers,
            ...(options.headers || {}),
          },
        });

        if (backupRes.status === 204) return null;

        const backupData = await backupRes.json();

        if (!backupRes.ok) {
          throw new Error(`Backup API error! status: ${backupRes.status}, message: ${backupData.error || backupData.message}`);
        }

        return backupData;
      } catch (backupErr) {
        console.error("Backup fetchWithToken ERROR:", backupErr);
        throw backupErr;
      }
    }

    throw err;
  }
};