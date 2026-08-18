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