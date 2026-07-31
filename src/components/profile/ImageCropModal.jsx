import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../utils/cropImage";

export default function ImageCropModal({
  open,
  image,
  aspect = 1,
  cropShape = "round",
  onCropComplete,
  onCancel,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
const [croppedAreaPixels, setCroppedAreaPixels] =
  useState(null);


  const handleCropComplete = useCallback(
  (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  },
  []
);

  if (!open || !image) return null;

const handleCrop = async () => {
  try {
    const croppedFile = await getCroppedImg(
      image,
      croppedAreaPixels
    );

    onCropComplete?.(croppedFile);

  } catch (err) {
    console.error(err);
    alert("Failed to crop image.");
  }
};

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-md p-4">

        <h2 className="text-xl font-bold mb-4">
          Crop Image
        </h2>

        <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-5">
          <label className="block text-sm mb-2">
            Zoom
          </label>

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) =>
              setZoom(Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg bg-gray-300"
          >
            Cancel
          </button>

          <button
  onClick={handleCrop}
  className="flex-1 py-3 rounded-lg bg-blue-600 text-white"
>
  Crop
</button>
        </div>

      </div>
    </div>
  );
}