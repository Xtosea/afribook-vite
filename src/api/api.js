// src/api/api.js

// Main backend URL (from env)
const MAIN_API = import.meta.env.VITE_API_BASE;

// Backup backend URL
const BACKUP_API = "https://afribook-backend.onrender.com";

// Final API Base
export const API_BASE = MAIN_API || BACKUP_API;


export const fetchWithToken = async (url, token, options = {}) => {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const headers = {
    ...(options.headers || {}),
  };

  // Only set Content-Type if NOT FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Server returned non-JSON:", text);
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      console.error("API Error:", data);
      throw new Error(data?.message || "Request failed");
    }

    return data;
  } catch (err) {
    console.error("fetchWithToken ERROR:", err);
    throw err;
  }
};