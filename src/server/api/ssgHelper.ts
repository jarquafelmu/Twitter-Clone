import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { appRouter } from "./root";
import { createInnerTRPCContext } from "./trpc";

// generate static sites
export function ssgHelper() {
  return createServerSideHelpers({
    router: appRouter,
    // user will be null so we don't need a session
    ctx: createInnerTRPCContext({ session: null, revalidateSSG: null }),
    transformer: superjson,
  });
}
