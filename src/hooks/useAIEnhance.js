
import { API_BASE } from "../api/api";

export const useAIEnhance = () => {
const enhanceImage = async (imageUrl) => {
const res = await fetch(${API_BASE}/api/ai/enhance, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({ imageUrl }),
});

const data = await res.json();  

if (!res.ok) {  
  throw new Error(data.error || "Enhance failed");  
}  

return data.enhancedUrl;

};

return { enhanceImage };
};

