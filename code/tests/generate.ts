import { faker } from "@faker-js/faker";
import { build, perBuild } from "@jackfranklin/test-data-bot";
import type { User } from "../src/app/common/user";

export const buildUser = build<User>({
  fields: {
    id: perBuild(() => faker.string.uuid()),
    username: perBuild(() => faker.internet.userName()),
    password: perBuild(() => faker.internet.password()),
  },
});
