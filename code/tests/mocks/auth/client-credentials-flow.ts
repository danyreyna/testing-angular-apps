import { faker } from "@faker-js/faker";
import { build, perBuild } from "@jackfranklin/test-data-bot";
import type { Jwt } from "./jwt";

export type ClientCredentialsFlowResponse = {
  access_token: Jwt;
  token_type: "Bearer";
  expires_in: number;
};

export type ClientCredentialsFlowRequest = {
  audience: string;
  grant_type: "client_credentials";
  client_id: string;
  client_secret: string;
};

export const buildClientCredentialsFlowRequest =
  build<ClientCredentialsFlowRequest>({
    fields: {
      audience: "https://api.example.com",
      grant_type: "client_credentials",
      client_id: perBuild(() => faker.string.alphanumeric({ length: 32 })),
      client_secret: faker.string.fromCharacters(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_",
        64,
      ),
    },
  });
