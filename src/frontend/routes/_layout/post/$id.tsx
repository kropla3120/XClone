import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/lib/utils";
import { PostDTO } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_layout/post/$id")({
  component: PostDetails,
});

function PostDetails() {
  const router = useRouter();
  const { id } = Route.useParams();
  const [commentContent, setCommentContent] = useState("");

  const { data } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const response = await fetchApi(`/api/posts/${id}`, router);
      return (await response?.json()) as PostDTO;
    },
  });

  const { data: responses, refetch: refetchResponses } = useQuery({
    queryKey: ["responses", id],
    queryFn: async () => {
      const response = await fetchApi(`/api/posts/${id}/responses`, router);
      return (await response?.json()) as PostDTO[];
    },
  });

  const handleComment = async (content: string) => {
    await fetchApi(`/api/posts`, router, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, responseToPostId: parseInt(id) }),
    });
    refetchResponses();
    setCommentContent("");
  };

  if (!data) return <div></div>;
  return (
    <>
      {/* <div className="absolute right-0 top-0 p-4 flex gap-4">
        <Button variant={"secondary"} onClick={handleLogout}>
          Wyloguj
        </Button>
        <Button onClick={switchTheme}>
          @ts-ignore
          <ion-icon name="moon-outline"></ion-icon>
        </Button>
      </div> */}
      <div className="flex justify-center p-8 ">
        <div className="flex-col flex gap-4">
          <div className="flex gap-8">
            <Link to="/">
              {/* @ts-ignore */}
              <ion-icon size="large" name="arrow-back-outline" className="cursor-pointer"></ion-icon>
            </Link>
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
              {responses
                ?.sort((a, b) => {
                  //@ts-ignore
                  return new Date(b.created) - new Date(a.created);
                })
                .map((post) => <Post short post={post} key={post.id} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
