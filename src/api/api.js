// src/api/api.js

// Define your main API URL
export const API_BASE = "https://your-main-api.com"; // <-- replace with your real API URL
export const MAIN_API = "https://your-main-api.com";
export const BACKUP_API = "https://your-backup-api.com"; // optional

// Fetch helper
export const fetchWithToken = async (url, token, options = {}) => {
  const headers = {};

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  try {
    const res = await fetch(fullUrl, { ...options, headers });

    if (res.status === 204) return null;

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message);
    }

    return data;
  } catch (err) {
    console.error("fetchWithToken ERROR:", err);

    // Retry with backup
    if (MAIN_API && BACKUP_API && MAIN_API !== BACKUP_API) {
      try {
        const backupUrl = url.startsWith("http") ? url : `${BACKUP_API}${url}`;

        const backupRes = await fetch(backupUrl, { ...options, headers });

        if (backupRes.status === 204) return null;

        const backupData = await backupRes.json();

        if (!backupRes.ok) {
          throw new Error(backupData.error || backupData.message);
        }

        return backupData;
      } catch (backupErr) {
        console.error("Backup fetch ERROR:", backupErr);
        throw backupErr;
      }
    }

    throw err;
  }
};