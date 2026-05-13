import { API_BASE } from "../api/api";

export const useR2Upload = () => {

  const uploadVideo = async (file) => {

    // STEP 1: GET SIGNED URL
    const res = await fetch(
      `${API_BASE}/api/r2/signed-url?contentType=${encodeURIComponent(file.type)}`
    );

    console.log("SIGNED URL RESPONSE STATUS:", res.status);

    const data = await res.json();

    console.log("SIGNED URL DATA:", data);

    // STEP 2: UPLOAD TO R2
    const uploadRes = await fetch(data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    console.log("UPLOAD STATUS:", uploadRes.status);

    // DEBUG RESPONSE
    const uploadText = await uploadRes.text();

    console.log("UPLOAD RESPONSE:", uploadText);

    if (!uploadRes.ok) {
      throw new Error("R2 upload failed");
    }

    // STEP 3: RETURN PUBLIC URL
    return data.fileUrl;
  };

  return { uploadVideo };
};