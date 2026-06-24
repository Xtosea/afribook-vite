export async function uploadToCloudinary(file) {

  alert(
    "URL = " +
    import.meta.env.VITE_CLOUDINARY_UPLOAD_URL
  );

  alert(
    "PRESET = " +
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );

  const response = await fetch(
    import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
      "Cloudinary upload failed"
    );
  }

  return data.secure_url;
}