export const checkViral = (
  reel
) => {

  const likes =
    reel.likes?.length || 0;

  const shares =
    reel.shares || 0;

  const views =
    reel.views?.length || 0;

  const score =
    likes * 2 +
    shares * 3 +
    views;

  if (score >= 10000) {
    reel.viral = true;

    reel.multiplier = 2;
  }

  return reel;
};
