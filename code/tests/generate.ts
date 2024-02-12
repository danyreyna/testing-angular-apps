import { faker } from "@faker-js/faker";
import { build, perBuild } from "@jackfranklin/test-data-bot";

export const buildUser = build<{
  id: string;
  username: string;
  password: string;
}>({
  fields: {
    id: perBuild(() => faker.datatype.uuid()),
    username: perBuild(() => faker.internet.userName()),
    password: perBuild(() => faker.internet.password()),
  },
});
