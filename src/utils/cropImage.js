export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

const getRadianAngle = (degreeValue) =>
  (degreeValue * Math.PI) / 180;

export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0
) {
  const image = await createImage(imageSrc);

  const canvas =
    document.createElement("canvas");

  const ctx = canvas.getContext("2d");

  const rotRad =
    getRadianAngle(rotation);

  const sin = Math.abs(
    Math.sin(rotRad)
  );

  const cos = Math.abs(
    Math.cos(rotRad)
  );

  const bBoxWidth =
    image.width * cos +
    image.height * sin;

  const bBoxHeight =
    image.width * sin +
    image.height * cos;

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(
    bBoxWidth / 2,
    bBoxHeight / 2
  );

  ctx.rotate(rotRad);

  ctx.drawImage(
    image,
    -image.width / 2,
    -image.height / 2
  );

  const croppedCanvas =
    document.createElement("canvas");

  const croppedCtx =
    croppedCanvas.getContext("2d");

  croppedCanvas.width =
    pixelCrop.width;

  croppedCanvas.height =
    pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
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
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) return;

        resolve(
          new File(
            [blob],
            "cropped.jpg",
            {
              type: "image/jpeg",
            }
          )
        );
      },
      "image/jpeg",
      0.95
    );
  });
}