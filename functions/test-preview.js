export async function onRequest() {
  return new Response("CLOUDFLARE TEST FUNCTION WORKS", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}