// src/api/api.js

// Main backend URL (from env)
const MAIN_API = import.meta.env.VITE_API_BASE;

// Backup backend URL
const BACKUP_API = "https://afribook-backend.onrender.com";

// Final API Base
export const API_BASE = MAIN_API || BACKUP_API;


export const fetchWithToken = async (url, token, options = {}) => {
  const headers = options.headers || {};

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  try {
    const res = await fetch(fullUrl, { ...options, headers });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      console.error("Server returned non-JSON:", text);
      throw new Error("Server error");
    }

  } catch (err) {
    console.error("fetchWithToken ERROR:", err);
    throw err;
  }
};