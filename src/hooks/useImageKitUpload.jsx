export const useImageKitUpload = () => {
  const uploadImageKit = async (file, token) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/imagekit/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    return data.url;
  };

  return { uploadImageKit };
};
