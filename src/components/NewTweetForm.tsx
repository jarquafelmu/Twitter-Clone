import { useSession } from "next-auth/react";
import { Button } from "./Button";
import { ProfileImage } from "./ProfileImage";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { toastError } from "./Toast";
import toast from "react-hot-toast";
import { TweetSummary } from "~/utils/types";

function updateTextAreaSize(textarea?: HTMLTextAreaElement) {
  if (textarea == null) return;
  textarea.style.height = "0";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export function NewTweetForm() {
  const session = useSession();
  if (session.status !== "authenticated") return null;

  // Only render the form if we are authenticated
  return <Form userImageSrc={session.data.user.image} />;
}

function Form({ userImageSrc }: { userImageSrc?: string | null }) {
  const session = useSession();
  const [text, setText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const toastId = "new-tweet";
  const [isDisabled, setIsDisabled] = useState(false);

  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);
  const trpcUtils = api.useContext();

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [text]);

  const createTweet = api.tweet.create.useMutation({
    onSuccess: (newTweet) => {
      toast.success("Tweeted!", { id: toastId });
      setText("");

      // should never be hit but is here just in case.
      if (session.status !== "authenticated") return;

      const updateData: Parameters<
        typeof trpcUtils.tweet.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (!oldData?.pages[0]) return;

        const newCacheTweet = {
          ...newTweet,
          likeCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user.id || null,
            name: session.data.user.name ?? null,
            image: session.data.user.image ?? null,
          },
        } as TweetSummary;

        return {
          ...oldData,
          pages: [
            // insert our new tweet into the first page
            {
              ...oldData.pages[0],
              tweets: [newCacheTweet, ...oldData.pages[0].tweets],
            },
            // keep everything after the first page the same
            ...oldData.pages.slice(1),
          ],
        };
      };

      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updateData);
    },
    onError: (err) => toastError(err, toastId),
    onSettled: () => setIsDisabled(false),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.length === 0) return toastError("Tweet cannot be empty");
    toast.loading("Tweeting...", { id: toastId });

    setIsDisabled(true);
    createTweet.mutate({ content: text });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border-b px-4 py-2"
    >
      <div className="flex gap-4 ">
        <ProfileImage src={userImageSrc} />
        <textarea
          ref={inputRef}
          style={{ height: 0 }}
          value={text}
          className="flex-grow resize-none overflow-hidden p-4 text-lg outline-none"
          placeholder="What's happening?"
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <Button disabled={isDisabled} className="self-end">
        Tweet
      </Button>
    </form>
  );
}
