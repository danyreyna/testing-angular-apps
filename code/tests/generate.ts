import { faker } from "@faker-js/faker";
import { build, perBuild } from "@jackfranklin/test-data-bot";
import type { User } from "../src/app/common/user";

export const buildUser = build<User>({
  fields: {
    id: perBuild(() => faker.string.uuid()),
    username: perBuild(() => faker.internet.userName()),
    password: perBuild(() => faker.internet.password()),
    source: "registration",
  },
  traits: {
    generatedInTest: {
      overrides: { source: "test" },
    },
  },
});

export type Jwt = `${string}.${string}.${string}`;

export function generateJwt(): Jwt {
  return `eyJ${faker.string.alphanumeric({ length: 71 })}J9.eyJ${faker.string.alphanumeric({ length: 371 })}J9.${faker.string.fromCharacters(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-",
    342,
  )}`;
}
