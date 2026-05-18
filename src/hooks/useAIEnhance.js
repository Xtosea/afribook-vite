import { API_BASE } from "../api/api";

export const useAIEnhance = () => {
  const enhanceImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE}/api/ai/enhance`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Enhance failed");
      }

      return data.enhancedUrl;
    } catch (err) {
      console.error("AI Enhance Error:", err);
      throw err;
    }
  };

  return { enhanceImage };
};