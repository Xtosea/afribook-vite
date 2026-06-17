import { API_BASE }
from "../api/api";

export const useAIEffects = () => {

  const applyEffect = async (
    imageUrl,
    effect
  ) => {

    const res = await fetch(
      `${API_BASE}/api/ai/effect`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          effect,
        }),
      }
    );

    const data =
      await res.json();

    return data.processedUrl;
  };

  return {
    applyEffect,
  };
};