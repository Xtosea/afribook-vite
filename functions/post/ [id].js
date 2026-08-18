const SOCIAL_BOTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "WhatsApp",
  "TelegramBot",
  "LinkedInBot",
  "Slackbot",
  "Discordbot",
  "Pinterestbot",
  "Googlebot",
  "bingbot",
  "Applebot",
];

function isSocialBot(userAgent = "") {
  const ua = userAgent.toLowerCase();

  return SOCIAL_BOTS.some((bot) =>
    ua.includes(bot.toLowerCase())
  );
}

export async function onRequest(context) {
  return new Response(
    `CLOUDFLARE FUNCTION WORKS - ${context.params.id}`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}

  const backendUrl =
    `https://afribook-backend.onrender.com/post/${id}`;

  try {
    const response = await fetch(backendUrl, {
      headers: {
        "User-Agent": userAgent,
        "Accept": "text/html",
      },
    });

    console.log(
      "BACKEND PREVIEW STATUS:",
      response.status
    );

    if (!response.ok) {
      return next();
    }

    const html = await response.text();

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
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