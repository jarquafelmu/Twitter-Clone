import { useSession } from "next-auth/react";
import { Button } from "./Button";
import { ProfileImage } from "./ProfileImage";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { api } from "~/utils/api";
import { toastError } from "./Toast";
import toast from "react-hot-toast";

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
  const [text, setText] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const toastId = "new-tweet";
  const [isDisabled, setIsDisabled] = useState(false);

  const inputRef = useCallback((textArea: HTMLTextAreaElement) => {
    updateTextAreaSize(textArea);
    textAreaRef.current = textArea;
  }, []);

  useLayoutEffect(() => {
    updateTextAreaSize(textAreaRef.current);
  }, [text]);

  const createTweet = api.tweet.create.useMutation({
    onSuccess: () => {
      toast.success("Tweeted!", { id: toastId });
      setText("");
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
