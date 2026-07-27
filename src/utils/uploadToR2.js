import { API_BASE } from "../api/api";

export const uploadToR2 = async (file) => {
  // Get signed upload URL
  const res = await fetch(`${API_BASE}/api/r2/signed-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder: "stories",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to get signed URL");
  }

  const { uploadUrl, fileUrl } = await res.json();

  // Upload directly to R2
  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!upload.ok) {
    throw new Error("R2 upload failed");
  }

  return fileUrl;
};
