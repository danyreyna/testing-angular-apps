import { faker } from "@faker-js/faker";

export type Jwt = `${string}.${string}.${string}`;

export function generateJwt(): Jwt {
  return `eyJ${faker.string.alphanumeric({ length: 71 })}J9.eyJ${faker.string.alphanumeric({ length: 371 })}J9.${faker.string.fromCharacters(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-",
    342,
  )}`;
}
