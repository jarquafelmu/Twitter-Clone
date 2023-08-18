import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const DEFAULT_PAGINATION_LIMIT = 10;

export const tweetRouter = createTRPCRouter({
  infiniteFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(
      async ({ input: { limit = DEFAULT_PAGINATION_LIMIT, cursor }, ctx }) => {
        /* 
          * Explanation of what's going on here.
          At first the cursor is undefined, so we get the 11 most recent tweets.

          We return 10 of them. Then with the last one, we look at the createdAt 
          and id and pas it as a cursor to the next query.

          The next query will then return the next 10 tweets that were created before the cursor.

          The only reason why order by id is there is because createdAt is not unique, so we need to order by id 
          as well to make sure that the order is consistent.
        */
        return ctx.prisma.tweet.findMany({
          take: limit + 1,
          cursor: cursor ? { createdAt_id: cursor } : undefined,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        });
      }
    ),
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      return ctx.prisma.tweet.create({
        data: {
          content,
          userId: ctx.session.user.id,
        },
      });
    }),
});
