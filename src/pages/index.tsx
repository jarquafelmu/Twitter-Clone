import { type NextPage } from "next";
import { NewTweetForm } from "~/components/NewTweetForm";
import { RecentTweets } from "~/components/RecentTweets";

const Home: NextPage = () => {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
      </header>
      <NewTweetForm />
      <RecentTweets />
    </>
  );
};

export default Home;
