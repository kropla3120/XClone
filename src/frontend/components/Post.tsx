import { generateAvatar } from "@/lib/utils";
import { PostDTO } from "@/types";
import { useRouter } from "@tanstack/react-router";
import React from "react";
import EditPost from "./EditPost";

const Post = ({ post, short }: { post: PostDTO; short: boolean }) => {
  const router = useRouter();
  return (
    <div className="relative">
      <div className="absolute right-0">
        <EditPost post={post} />
      </div>
      <div
        className="w-full flex gap-3 border border-grey-500 p-4 dark:hover:bg-zinc-900 hover:bg-zinc-50 cursor-pointer"
        onClick={() => {
          router.navigate({
            to: `/post/${post.id}`,
          });
        }}
      >
        <div className="flex ">
          <img src={generateAvatar(`${post.user.firstName} ${post.user.lastName}`)} alt="avatar" className="w-8 h-8 rounded-full" />
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div className="flex gap-1">
              <span className="font-bold">
                {post.user.firstName} {post.user.lastName}
              </span>
              <span className="text-gray-500">@{post.user.username}</span>
              <span className="text-gray-500">{new Date(post.created).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="w-full">
            <h2 className="text-xl font-bold">{post.title}</h2>
            <p
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordWrap: short ? "normal" : "break-word",
                height: short ? "1.5em" : "auto",
                width: "500px",
              }}
            >
              {post.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
