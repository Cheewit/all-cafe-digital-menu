// This file has been deprecated as per user request to use the Gemini API key directly on the client-side.
// The API key is now sourced from `process.env.API_KEY` in the component files.

export const config = {
  runtime: 'edge',
};

export default function handler(_request: Request) {
  return new Response('This endpoint is deprecated and no longer in use.', { status: 410 }); // 410 Gone
}