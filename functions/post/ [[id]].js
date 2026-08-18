const SOCIAL_BOTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "WhatsApp",
  "TelegramBot",
  "LinkedInBot",
  "Slackbot",
  "Discordbot",
  "Googlebot",
  "bingbot",
];

function isSocialBot(userAgent = "") {
  const ua = userAgent.toLowerCase();

  return SOCIAL_BOTS.some((bot) =>
    ua.includes(bot.toLowerCase())
  );
}

export async function onRequest(context) {
  const { request, params, next } = context;

  const id = params.id;

  if (!id) {
    return next();
  }

  const userAgent =
    request.headers.get("user-agent") || "";

  /*
   * Normal visitors should continue to React.
   */
  if (!isSocialBot(userAgent)) {
    return next();
  }

  /*
   * Social-media crawler.
   */
  const backendUrl =
    `https://afribook-backend.onrender.com/post/${id}`;

  try {
    const response = await fetch(backendUrl, {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html",
      },
    });

    if (!response.ok) {
      console.error(
        "SOCIAL PREVIEW BACKEND STATUS:",
        response.status
      );

      return next();
    }

    const html = await response.text();

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type":
          "text/html; charset=UTF-8",

        "Cache-Control":
          "public, max-age=60, s-maxage=300",
      },
    });

  } catch (error) {
    console.error(
      "SOCIAL PREVIEW ERROR:",
      error
    );

    return next();
  }
}