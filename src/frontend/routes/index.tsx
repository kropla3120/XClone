import AddPost from "@/components/AddPost";
import Post from "@/components/Post";
import { PostDTO } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, createLazyFileRoute, redirect, useRouter } from "@tanstack/react-router";

const Index = () => {
  const router = useRouter();
  const { data: posts, error } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("/api/posts");
      if (response.status === 401) {
        window.sessionStorage.setItem("loggedIn", "false");
        router.navigate({
          to: "/login",
        });
        return [];
      }
      return (await response.json()) as PostDTO[];
    },
  });

  // console.log(error);

  return (
    <div className="flex justify-center p-8 ">
      <div className="w-[600px] flex flex-col border-[-1px] border-grey-500">
        <AddPost />
        <div className="flex flex-col">
          {posts ? (
            posts
              .sort((a, b) => {
                //@ts-ignore
                return new Date(b.created) - new Date(a.created);
              })
              .map((p) => <Post short post={p} />)
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: () => {
    // console.log(context);
    if (window.sessionStorage.getItem("loggedIn") !== "true") {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
});
