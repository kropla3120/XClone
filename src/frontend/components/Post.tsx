import { PostDTO } from "@/types";
import { useRouter } from "@tanstack/react-router";
import React from "react";

const Post = ({ post, short }: { post: PostDTO; short: boolean }) => {
  const router = useRouter();
  return (
    <div
      className="w-full flex gap-3 border border-grey-500 p-4 hover:bg-zinc-900 cursor-pointer"
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
        <div className="flex gap-1">
          <span className="font-bold">
            {post.user.firstName} {post.user.lastName}
          </span>
          <span className="text-gray-500">@{post.user.username}</span>
          <span className="text-gray-500">{new Date(post.created).toLocaleDateString()}</span>
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
  );
};

const generateAvatar = (name: string) => {
  if (!name) return document.createElement("canvas").toDataURL();
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 100;
  canvas.height = 100;
  if (!ctx) return;
  const hash = name.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hue = hash % 360;
  ctx.fillStyle = `hsl(${hue}, 100%, 87%)`;
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = `hsl(${hue}, 70%, 15%)`;
  ctx.font = "bold 45px 'Roboto'";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, 50, 50);
  return canvas.toDataURL();
};

export default Post;
