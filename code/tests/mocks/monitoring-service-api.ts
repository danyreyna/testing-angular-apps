import { http, HttpResponse } from "msw";
import type { Rfc9457ProblemDetail } from "../../src/app/common/rfc-9457-problem-detail";
import { generateJwt } from "../generate";

const EXPIRES_24_HOURS = 86400;

export const handlers = [
  http.post(
    "https://some-monitoring-service.com/oauth/token",
    async ({ request }) => {
      const formData = await request.formData();

      console.log("The real third party API should validate these...");
      console.log(`audience: ${formData.get("audience")}`);
      console.log(`grant_type: ${formData.get("grant_type")}`);
      console.log(`client_id: ${formData.get("client_id")}`);
      console.log(`client_secret: ${formData.get("client_secret")}`);

      return HttpResponse.json({
        access_token: generateJwt(),
        token_type: "Bearer",
        expires_in: EXPIRES_24_HOURS,
      });
    },
  ),
  http.post(
    "https://some-monitoring-service.com/metrics",
    async ({ request }) => {
      // The real third party API should validate the bearer token
      const authorizationHeader = request.headers.get("Authorization");
      if (authorizationHeader === null) {
        const status = 401;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: `A token in the "Authorization" header is needed`,
            detail: "Can't post metrics without a token",
          },
          {
            status,
          },
        );
      }

      return new HttpResponse(null, { status: 204 });
    },
  ),
];
