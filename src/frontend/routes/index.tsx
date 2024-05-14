import AddPost from "@/components/AddPost";
import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import { PostDTO } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, createLazyFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useContext } from "react";

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

  // console.log(error);

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
        <div className="w-[600px] flex flex-col border-[-1px] border-grey-500">
          <AddPost />
          <div className="flex flex-col">
            {posts ? (
              posts
                .sort((a, b) => {
                  //@ts-ignore
                  return new Date(b.created) - new Date(a.created);
                })
                .map((p) => <Post key={p.id} short post={p} />)
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </div>
    </>
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
