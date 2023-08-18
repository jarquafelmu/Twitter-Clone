import InfiniteTweetList from "./InfiniteTweetList";

export function RecentTweets(): JSX.Element {
  const tweets = [];
  return <InfiniteTweetList tweets={tweets} />;
}
