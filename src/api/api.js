// src/api/api.js

const MAIN_API = import.meta.env.VITE_API_BASE;

export const API_BASE = MAIN_API;

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

    console.log(
      "🔐 API TOKEN ATTACHED:",
      token.substring(0, 20) + "...",
      "URL:",
      fullUrl
    );
  } else {
    console.error("❌ NO TOKEN ATTACHED:", fullUrl);
  }

  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        "🌐 API REQUEST:",
        fullUrl,
        `attempt ${attempt + 1}/${maxRetries + 1}`
      );

      console.log("🔑 HAS TOKEN:", !!token);
      console.log(
        "🔑 TOKEN LENGTH:",
        token ? token.length : 0
      );

      const res = await fetch(fullUrl, {
        ...options,
        headers,
      });

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error(
          "❌ Server returned non-JSON:",
          text
        );

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
          data?.message ||
          `Request failed (${res.status})`
        );
      }

      return data;

    } catch (err) {
      const isNetworkError =
        err instanceof TypeError &&
        err.message === "Failed to fetch";

      if (!isNetworkError || attempt === maxRetries) {
        console.error(
          "fetchWithToken ERROR:",
          err
        );

        throw err;
      }

      const delay = 500 * (attempt + 1);

      console.warn(
        `⚠️ Network request failed. Retrying in ${delay}ms...`,
        {
          attempt: attempt + 1,
          url: fullUrl,
        }
      );

      await sleep(delay);
    }
  }
};
