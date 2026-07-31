import React, {
  useState,
  useCallback,
  useRef,
} from "react";

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
const [rotation, setRotation] = useState(0);



  const lastTap = useRef(0);

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
  croppedAreaPixels,
  rotation
);

    onCropComplete?.(croppedFile);

  } catch (err) {
    console.error(err);
    alert("Failed to crop image.");
  }
};


const handleDoubleTap = () => {
  const now = Date.now();

  if (now - lastTap.current < 300) {
    setZoom((prev) =>
      prev < 2 ? 2 : 1
    );
  }

  lastTap.current = now;
};



useEffect(() => {
  if (open) {
    setRotation(0);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  }
}, [open]);

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-md p-4">

        <h2 className="text-xl font-bold mb-4">
          Crop Image
        </h2>

 <div
  className="relative w-full h-80 bg-black rounded-lg overflow-hidden"
  onTouchEnd={handleDoubleTap}
>
  <Cropper
  image={image}
  crop={crop}
  zoom={zoom}
  rotation={rotation}
  aspect={aspect}
  cropShape={cropShape}
  onCropChange={setCrop}
  onZoomChange={setZoom}
  onCropComplete={handleCropComplete}
  zoomWithScroll
  minZoom={1}
  maxZoom={5}
  showGrid={false}
  objectFit="contain"
/>
</div>

        <div className="mt-5">
  <div className="flex items-center gap-3">
    <span>🔍</span>

    <input
      type="range"
      min={1}
      max={5}
      step={0.05}
      value={zoom}
      onChange={(e) =>
        setZoom(Number(e.target.value))
      }
      className="flex-1"
    />

    <span>{zoom.toFixed(1)}x</span>
  </div>
</div>

        
<div className="mt-5">
  <div className="flex items-center gap-3">
    <span>↻</span>

    <input
      type="range"
      min={0}
      max={360}
      step={1}
      value={rotation}
      onChange={(e) =>
        setRotation(Number(e.target.value))
      }
      className="flex-1"
    />

    <span>{rotation}°</span>
  </div>
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