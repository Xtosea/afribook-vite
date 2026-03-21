// src/api/api.js

// Main backend URL
const MAIN_API = import.meta.env.VITE_API_BASE;

// Backup backend URL (optional)
const BACKUP_API = import.meta.env.VITE_BACKUP_API_BASE || MAIN_API;

// Export API_BASE dynamically
export const API_BASE = MAIN_API || BACKUP_API;

export const fetchWithToken = async (url, token, options = {}) => {
  const headers = {};

  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  try {
    const res = await fetch(fullUrl, { ...options, headers });
    if (res.status === 204) return null;

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message);

    return data;
  } catch (err) {
    console.error("fetchWithToken ERROR:", err);

    // Retry with backup if main fails
    if (MAIN_API && BACKUP_API && MAIN_API !== BACKUP_API) {
      try {
        const backupUrl = url.startsWith("http") ? url : `${BACKUP_API}${url}`;
        const backupRes = await fetch(backupUrl, { ...options, headers });
        if (backupRes.status === 204) return null;
        const backupData = await backupRes.json();
        if (!backupRes.ok) throw new Error(backupData.error || backupData.message);
        return backupData;
      } catch (backupErr) {
        console.error("Backup fetchWithToken ERROR:", backupErr);
        throw backupErr;
      }
    }
    throw err;
  }
};