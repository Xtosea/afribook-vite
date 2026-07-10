import React, { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";

const CLOUDINARY_URL =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_URL;

const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function ImageUploader({
  images,
  setImages,
  isPremium = false,
}) {
  const inputRef = useRef(null);

  const [uploading, setUploading] =
    useState(false);

  const maxImages = isPremium ? 10 : 2;

  const MAX_SIZE = 5 * 1024 * 1024;

  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  // ===============================
  // Open File Picker
  // ===============================
  const openPicker = () => {
    inputRef.current?.click();
  };

  // ===============================
  // Remove Image
  // ===============================
  const removeImage = (index) => {
  setImages(
    images.filter((_, i) => i !== index)
  );
};

  // ===============================
  // Upload
  // ===============================
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      alert(
        `You can upload only ${maxImages} image(s).`
      );
      return;
    }

    setUploading(true);

    try {
      const uploaded = [];

      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`${file.name} is not supported.`);
          continue;
        }

        if (file.size > MAX_SIZE) {
          alert(
            `${file.name} exceeds the 5MB limit.`
          );
          continue;
        }

        const formData = new FormData();

        formData.append("file", file);
        formData.append(
          "upload_preset",
          UPLOAD_PRESET
        );

        formData.append(
          "folder",
          "marketplace"
        );

        const response = await fetch(
          CLOUDINARY_URL,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        uploaded.push({
          url: data.secure_url,
          public_id: data.public_id,
        });
      }

      setImages([
  ...images,
  ...uploaded,
]);
    } catch (err) {
      console.error(err);

      alert("Image upload failed.");
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept="image/*"
        onChange={handleUpload}
      />

      <button
        type="button"
        onClick={openPicker}
        disabled={uploading}
        className="w-full border-2 border-dashed rounded-xl p-6 hover:bg-gray-50"
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2
              size={22}
              className="animate-spin"
            />
            Uploading...
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={35} />

            <p className="font-semibold">
              Upload Images
            </p>

            <p className="text-sm text-gray-500">
              {images.length}/{maxImages} uploaded
            </p>
          </div>
        )}
      </button>

      {Array.isArray(images) &&
 images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {Array.isArray(images) &&
 images.map((image, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden border"
            >
              <img
                src={image.url}
                alt=""
                className="w-full h-36 object-cover"
              />

              <button
                type="button"
                onClick={() =>
                  removeImage(index)
                }
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}