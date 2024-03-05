import { handlers as appHandlers } from "./app-handlers";
import { handlers as authHandlers } from "./auth/auth-handlers";
import { handlers as userHandlers } from "./user/user-handlers";

export const handlers = [...userHandlers, ...authHandlers, ...appHandlers];
