import html2canvas from "html2canvas";

export const captureStoryCard = async (element) => {
  if (!element) {
    throw new Error("Story element not found");
  }

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    scale: 2, // Higher quality
    logging: false,
  });

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/png",
      0.95
    );
  });
};