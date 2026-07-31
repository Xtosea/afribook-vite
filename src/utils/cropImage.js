export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc,
  pixelCrop
) {
  const image = await createImage(imageSrc);

  const canvas =
    document.createElement("canvas");

  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File(
        [blob],
        "cropped.jpg",
        {
          type: "image/jpeg",
        }
      );

      resolve(file);
    }, "image/jpeg", 0.95);
  });
}