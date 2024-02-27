import type { Jwt } from "./jwt";

export type ClientCredentialsFlowResponse = {
  access_token: Jwt;
  token_type: "Bearer";
  expires_in: number;
};
