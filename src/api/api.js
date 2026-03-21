// src/api/api.js
// ✅ Use Vite env variable
export const API_BASE = import.meta.env.VITE_API_BASE;

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
    throw err;
  }
};