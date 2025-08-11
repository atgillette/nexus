import { createTRPCRouter } from "./trpc";
import { dashboardRouter } from "./routers/dashboard";
import { profileRouter } from "./routers/profile";
import { usersRouter } from "./routers/users";
import { companiesRouter } from "./routers/companies";
import { workflowsRouter } from "./routers/workflows";
import { subscriptionPlansRouter } from "./routers/subscriptionPlans";
import { credentialsRouter } from "./routers/credentials";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  dashboard: dashboardRouter,
  profile: profileRouter,
  users: usersRouter,
  companies: companiesRouter,
  workflows: workflowsRouter,
  subscriptionPlans: subscriptionPlansRouter,
  credentials: credentialsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;