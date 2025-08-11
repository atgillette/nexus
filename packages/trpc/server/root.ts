import { createTRPCRouter } from "./trpc";
import { dashboardRouter } from "./routers/dashboard";
import { profileRouter } from "./routers/profile";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  profile: profileRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;