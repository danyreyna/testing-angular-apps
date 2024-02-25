/*
 * In a real backend, this should be added to the CORS settings.
 * We'll leave this here just for reference.
 */
function getCorsHeaders(appOrigin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": appOrigin,
    "Access-Control-Allow-Credentials": "true",
  };
}

const APP_ORIGIN = "https://localhost:4200";

export const CORS_HEADERS = getCorsHeaders(APP_ORIGIN);
