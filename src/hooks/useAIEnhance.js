import { API_BASE } from "../api/api";

export const useAIEnhance = () => {
  const enhanceImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE}/api/ai/enhance`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    return data.enhancedUrl;
  };

  return { enhanceImage };
};