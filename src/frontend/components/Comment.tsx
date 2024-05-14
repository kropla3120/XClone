import { generateAvatar } from "@/lib/utils";
import { CommentDTO } from "@/types";
import { useRouter } from "@tanstack/react-router";
import React from "react";

const Comment = ({ comment }: { comment: CommentDTO }) => {
  const router = useRouter();
  return (
    <div className="w-full flex gap-3 border border-grey-500 p-4 ">
      <div className="flex ">
        <img src={generateAvatar(`${comment.user.firstName} ${comment.user.lastName}`)} alt="avatar" className="w-8 h-8 rounded-full" />
      </div>
      <div className="flex flex-col">
        <div className="flex gap-1">
          <span className="font-bold">
            {comment.user.firstName} {comment.user.lastName}
          </span>
          <span className="text-gray-500">@{comment.user.username}</span>
          <span className="text-gray-500">{new Date(comment.created).toLocaleDateString()}</span>
        </div>
        <div className="w-full">
          <p>{comment.content}</p>
        </div>
      </div>
    </div>
  );
};

export default Comment;
