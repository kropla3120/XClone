import Post from "@/components/Post";
import Comment from "@/components/Comment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentDTO, PostDTO } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/post/$id")({
  component: PostDetails,
});

function PostDetails() {
  const router = useRouter();
  const { id } = Route.useParams();
  const [commentContent, setCommentContent] = useState("");

  const { data } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${id}`);
      if (response.status === 401) {
        window.sessionStorage.setItem("loggedIn", "false");
        router.navigate({
          to: "/login",
          replace: true,
        });
      }
      return (await response.json()) as PostDTO;
    },
  });
  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${id}/comments`);
      if (response.status === 401) {
        window.sessionStorage.setItem("loggedIn", "false");
        router.navigate({
          to: "/login",
          replace: true,
        });
      }
      return (await response.json()) as CommentDTO[];
    },
  });

  const handleComment = async (content: string) => {
    await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    refetchComments();
  };
  const handleLogout = async () => {
    await fetch("/api/logout");
    window.sessionStorage.setItem("loggedIn", "false");
    router.navigate({
      to: "/login",
    });
  };
  const switchTheme = () => {
    if (window.sessionStorage.getItem("theme") === "light") {
      window.sessionStorage.setItem("theme", "dark");
      const root = window.document.documentElement;
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      window.sessionStorage.setItem("theme", "light");
      const root = window.document.documentElement;
      root.classList.remove("dark");
      root.classList.add("light");
    }
  };

  if (!data) return <div></div>;
  return (
    <>
      <div className="absolute right-0 top-0 p-4 flex gap-4">
        <Button variant={"secondary"} onClick={handleLogout}>
          Wyloguj
        </Button>
        <Button>
          {/* @ts-ignore */}
          <ion-icon onClick={switchTheme} name="moon-outline"></ion-icon>
        </Button>
      </div>
      <div className="flex justify-center p-8 ">
        <div className="flex-col flex gap-4">
          <div className="flex gap-8">
            <a href="/">
              {/* @ts-ignore */}
              <ion-icon size="large" name="arrow-back-outline" className="cursor-pointer"></ion-icon>
            </a>
            <p className="text-white text-2xl">Wpis</p>
          </div>

          <div className="w-[600px] flex flex-col border-[-1px] border-grey-500">
            <Post short={false} post={data} />
            <div className="flex gap-3 items-center border border-grey-500">
              <Textarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)} className="rounded-none border-0" placeholder="Opublikuj swoją odpowiedź" />
              <Button
                onClick={() => {
                  handleComment(commentContent);
                }}
                className="m-4"
              >
                Wyślij
              </Button>
            </div>
            <div>
              {comments
                ?.sort((a, b) => {
                  //@ts-ignore
                  return new Date(b.created) - new Date(a.created);
                })
                .map((comment) => <Comment key={comment.id} comment={comment} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
