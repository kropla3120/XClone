import Post from "@/components/Post";
import { PostDTO } from "@/types";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/post/$id")({
  loader: async (context) => {
    const response = await fetch(`/api/posts/${context.params.id}`);
    if (response.status === 401) {
      window.sessionStorage.setItem("loggedIn", "false");
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
    return (await response.json()) as PostDTO;
  },
  component: () => {
    const data = Route.useLoaderData();
    return (
      <div className="flex justify-center p-8 ">
        <div className="w-[600px] flex flex-col border-[-1px] border-grey-500">
          <Post short={false} post={data} />
        </div>
      </div>
    );
  },
});
