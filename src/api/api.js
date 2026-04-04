// src/api/api.js

export const API_BASE = "https://afribook-backend.onrender.com";
export const BACKUP_API = "https://afribook-backup.onrender.com"; // optional

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

    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.error("Non-JSON response:", text);
      throw new Error(`Invalid JSON: ${text.substring(0, 200)}`);
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || "Unknown error");
    }

    return data;
  } catch (err) {
    console.error("fetchWithToken ERROR:", err);

    if (typeof BACKUP_API !== "undefined" && BACKUP_API !== API_BASE) {
      try {
        const backupUrl = url.startsWith("http") ? url : `${BACKUP_API}${url}`;
        const backupRes = await fetch(backupUrl, { ...options, headers });

        if (backupRes.status === 204) return null;

        const backupText = await backupRes.text();
        let backupData;

        try {
          backupData = JSON.parse(backupText);
        } catch {
          console.error("Backup invalid JSON:", backupText);
          throw new Error(`Backup invalid JSON: ${backupText.substring(0, 200)}`);
        }

        if (!backupRes.ok) {
          throw new Error(backupData.error || backupData.message || "Unknown backup error");
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