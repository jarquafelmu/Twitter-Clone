import { api } from "~/utils/api";
import InfiniteTweetList from "./InfiniteTweetList";

export function RecentTweets(): JSX.Element {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {}, // No query params because we want to start at the beginning
    { getNextPageParam: (lastPage) => lastPage.nextCursor } // Pass the nextCursor to the query function as the cursor
  );
  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={tweets.hasNextPage ?? false}
      fetchNextTweets={tweets.fetchNextPage}
    />
  );
}
