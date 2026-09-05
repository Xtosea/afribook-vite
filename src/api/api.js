// src/api/api.js

const MAIN_API = "https://africsocial-api.xto1971.workers.dev";

export const API_BASE = MAIN_API;

export const fetchWithToken = async (url, token, options = {}) => {
  const fullUrl = url.startsWith("http")
    ? url
    : `${API_BASE}${url}`;

  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {

   console.log("🌐 API REQUEST:", fullUrl);
console.log("🔑 HAS TOKEN:", !!token);

    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Server returned non-JSON:", text);
      throw new Error("Invalid server response");
    }

    if (!res.ok) {
      console.error("❌ API ERROR");
      console.error("URL:", fullUrl);
      console.error("STATUS:", res.status);
      console.error("RESPONSE:", data);

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      throw new Error(
        data?.message || `Request failed (${res.status})`
      );
    }

    return data;
  } catch (err) {
    console.error("fetchWithToken ERROR:", err);
    throw err;
  }
};