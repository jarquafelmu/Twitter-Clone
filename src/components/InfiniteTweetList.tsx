import InfiniteScroll from "react-infinite-scroll-component";
import { type TweetSummary } from "~/utils/types";
import { TweetCard } from "./TweetCard";
import { LoadingSpinner } from "./LoadingSpinner";

type InfiniteTweetListProps = {
  isError: boolean;
  isLoading: boolean;
  hasMore: boolean;
  fetchNextTweets: () => Promise<unknown>;
  tweets?: TweetSummary[];
};

export function InfiniteTweetList({
  tweets,
  isError,
  isLoading,
  hasMore = false,
  fetchNextTweets,
}: InfiniteTweetListProps): JSX.Element | null {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <h1>Error...</h1>;
  if (!tweets?.length)
    return (
      <h2 className="my-4 text-center text-2xl text-gray-500">No Tweets</h2>
    );

  return (
    <ul>
      <InfiniteScroll
        dataLength={tweets.length}
        next={fetchNextTweets}
        hasMore={hasMore}
        loader={<LoadingSpinner />}
      >
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} {...tweet} />
        ))}
      </InfiniteScroll>
    </ul>
  );
}

export default InfiniteTweetList;
