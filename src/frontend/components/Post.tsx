import { fetchApi, generateAvatar } from "@/lib/utils";
import { PostDTO } from "@/types";
import { useRouter } from "@tanstack/react-router";
import React, { useContext } from "react";
import EditPost from "./EditPost";
import { UserContext } from "@/context";
import DeletePost from "./DeletePost";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Post = ({ post, short }: { post: PostDTO; short: boolean }) => {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleFollow = async () => {
    const res = await fetchApi(`/api/followers/follow/${post.user.id}`, router, {
      method: "PUT",
    });

    const data = await res?.json();

    if (data.error) {
      toast.error(data.error);
    }
    if (data.message) {
      toast.success(data.message);
    }
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const handleUnfollow = async () => {
    const res = await fetchApi(`/api/followers/unfollow/${post.user.id}`, router, {
      method: "DELETE",
    });

    const data = await res?.json();

    if (data.error) {
      toast.error(data.error);
    }
    if (data.message) {
      toast.success(data.message);
    }
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const toggleLike = async () => {
    const res = await fetchApi(`/api/posts/${post.id}/like`, router, {
      method: post.likedByMe ? "DELETE" : "PUT",
    });

    const data = await res?.json();

    if (data.error) {
      toast.error(data.error);
    }
    if (post.responseToPostId !== null) {
      queryClient.invalidateQueries({ queryKey: ["responses", post.responseToPostId.toString()] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    }
  };

  const isFollowed = user?.following.map((x) => x.id).includes(post.user.id);

  return (
    <div className="relative">
      <div className="absolute right-0 flex">
        {post.myPost ? (
          <>
            <DeletePost post={post} isInPostDetails={!short} />
            <EditPost post={post} />
          </>
        ) : (
          <div className="p-2">
            {isFollowed ? (
              <Button size={"sm"} variant={"outline"} onClick={handleUnfollow}>
                Obserwujesz
              </Button>
            ) : (
              <Button size={"sm"} onClick={handleFollow}>
                Obserwuj
              </Button>
            )}
          </div>
        )}
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
            <p
              className="dark:text-gray-200 text-gray-800"
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
          <div className="w-full flex gap-1 mt-2">
            <Button
              size={"sm"}
              variant={"ghost"}
              className="gap-2 items-center"
              onClick={(e) => {
                e.stopPropagation();
                router.navigate({
                  to: `/post/${post.id}`,
                });
              }}
            >
              {/* @ts-ignore */}
              <ion-icon class="text-xl" name="chatbubble-outline"></ion-icon>
              <span>{post.responseCount}</span>
            </Button>
            <Button
              size={"sm"}
              variant={"ghost"}
              className="gap-2 items-center"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike();
              }}
            >
              {/* @ts-ignore */}
              <ion-icon class="text-xl" name={post.likedByMe ? "heart" : "heart-outline"}></ion-icon>
              <span>{post.likeCount}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
