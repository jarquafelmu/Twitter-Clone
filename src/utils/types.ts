import { type User } from "@prisma/client";

export type TweetSummary = {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  user: Pick<User, "id" | "name" | "image">;
  likedByMe: boolean;
};

export type ProfileSummary = {
  name: string;
  image: string;
  followersCount: number;
  followsCount: number;
  tweetsCount: number;
  isFollowing: boolean;
};
