import { API_BASE } from "../api/api";

export const useR2Upload = () => {

  const uploadVideo = async (file) => {

    // STEP 1
    const res = await fetch(
  `${API_BASE}/api/r2/signed-url?contentType=${encodeURIComponent(file.type)}`
);

    const data = await res.json();

    // STEP 2
    const uploadRes = await fetch(data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!uploadRes.ok) {
      throw new Error("R2 upload failed");
    }

    // STEP 3
    return data.fileUrl;
  };

  return { uploadVideo };
};