import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { type TweetSummary } from "~/utils/types";

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
        const currentUserId = ctx.session?.user?.id;

        const data: {
          user: {
            id: string;
            name: string | null;
            image: string | null;
          };
          id: string;
          createdAt: Date;
          content: string;
          likes: {
            userId: string;
            tweetId: string;
          }[];
          _count: {
            likes: number;
          };
        }[] = await ctx.prisma.tweet.findMany({
          take: limit + 1,
          /* 
          * Explanation of what's going on here.
          At first the cursor is undefined, so we get the 11 most recent tweets.

          We return 10 of them. Then with the last one, we look at the createdAt 
          and id and pas it as a cursor to the next query.

          The next query will then return the next 10 tweets that were created before the cursor.

          The only reason why order by id is there is because createdAt is not unique, so we need to order by id 
          as well to make sure that the order is consistent.
        */
          cursor: cursor ? { createdAt_id: cursor } : undefined,
          // Additionally, because we are using a cursor instead of an offset, it won't break if a tweet is added or deleted.
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          select: {
            id: true,
            content: true,
            createdAt: true,
            _count: { select: { likes: true } },
            // if any likes are returned, then this user has liked the tweet
            likes: !currentUserId
              ? false
              : { where: { userId: currentUserId } },
            user: {
              select: { name: true, id: true, image: true },
            },
          },
        });

        let nextCursor: typeof cursor | undefined;
        // if there are more than 10 items, there is more data to get so then we need to return a cursor
        if (data.length > limit) {
          const nextItem = data.pop();
          if (nextItem) {
            nextCursor = {
              id: nextItem.id,
              createdAt: nextItem.createdAt,
            };
          }
        }

        return {
          tweets: data.map((tweet): TweetSummary => {
            // massage the data to make it easier to use on the client
            return {
              id: tweet.id,
              content: tweet.content,
              createdAt: tweet.createdAt,
              likeCount: tweet._count.likes,
              user: tweet.user,
              likedByMe: tweet.likes?.length > 0,
            };
          }),
          nextCursor,
        };
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
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const data = { tweetId: id, userId: ctx.session.user.id };
      const existingLike = await ctx.prisma.like.findUnique({
        where: { userId_tweetId: data },
      });

      if (!existingLike) {
        // Like doesn't exist, create it
        await ctx.prisma.like.create({
          data,
        });
        return { addedLike: true };
      }

      // Like already exists, remove it
      await ctx.prisma.like.delete({
        where: { userId_tweetId: data },
      });
      return { addedLike: false };
    }),
});
