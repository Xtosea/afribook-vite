export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/post/")) {
      const backend =
        "https://site--afribook-backen--26q2cj27zn75.code.run" +
        url.pathname;

      const userAgent = request.headers.get("user-agent") || "";

      const isBot =
        /facebookexternalhit|WhatsApp|Twitterbot|TelegramBot|LinkedInBot|Slackbot|Discordbot/i.test(userAgent);

      if (isBot) {
        return fetch(backend);
      }

      return Response.redirect(
        "https://africsocial.globelynks.com" + url.pathname,
        302
      );
    }

    return new Response("AfricSocial Share Worker is running");
  },
};