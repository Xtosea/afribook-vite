export const getEffectUrl = (
  imageUrl,
  effect
) => {
  if (!imageUrl) return imageUrl;

  switch (effect) {
    case "enhance":
      return imageUrl.replace(
        "/upload/",
        "/upload/e_enhance/"
      );

    case "beauty":
      return imageUrl.replace(
        "/upload/",
        "/upload/e_improve/"
      );

    case "queen":
      return imageUrl.replace(
        "/upload/",
        "/upload/e_improve/co_rgb:1f0933/"
      );

    case "ceo":
      return imageUrl.replace(
        "/upload/",
        "/upload/e_sharpen,e_improve/"
      );

    case "gamer":
      return imageUrl.replace(
        "/upload/",
        "/upload/e_vibrance:80,e_sharpen/"
      );

    default:
      return imageUrl;
  }
};