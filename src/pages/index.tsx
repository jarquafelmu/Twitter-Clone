import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { FollowingTweets } from "~/components/FollowingTweets";
import { NewTweetForm } from "~/components/NewTweetForm";
import { RecentTweets } from "~/components/RecentTweets";

const TABS = ["Recent", "Following"] as const;

const Home: NextPage = () => {
  const [selectedTab, setSelectedTab] = useState<(typeof TABS)[number]>(
    TABS[0]
  );
  const session = useSession();
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        {session.status === "authenticated" && (
          <div className="flex">
            {TABS.map((tab) => {
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-grow p-2 hover:bg-gray-200 focus-visible:bg-gray-200 ${
                    tab === selectedTab
                      ? "border-b-4 border-b-blue-500 font-bold"
                      : "marker:"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}
      </header>
      <NewTweetForm />
      {selectedTab === "Recent" ? <RecentTweets /> : <FollowingTweets />}
    </>
  );
};

export default Home;
