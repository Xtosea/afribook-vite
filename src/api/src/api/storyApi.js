import { API_BASE } from "./api";

/* ================= GET ANALYTICS ================= */
export const fetchStoryAnalytics = async (storyId, token) => {
  const res = await fetch(
    `${API_BASE}/api/stories/analytics/${storyId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};

/* ================= FOR YOU FEED ================= */
export const fetchForYouFeed = async (token) => {
  const res = await fetch(
    `${API_BASE}/api/stories/feed/foryou`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return await res.json();
};