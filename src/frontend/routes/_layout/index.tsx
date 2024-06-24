import AddPost from "@/components/AddPost";
import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostDTO } from "@/types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import React from "react";
import { useEffect, useRef } from "react";

const POSTS_PER_PAGE = 10;

const Index = () => {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);
  const [onlyFollowing, setOnlyFollowing] = React.useState(false);

  const {
    data: posts,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", { onlyFollowing }],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/posts?offset=${pageParam * POSTS_PER_PAGE}&onlyFollowing=${onlyFollowing}`);
      if (response.status === 401) {
        window.localStorage.setItem("loggedIn", "false");
        router.navigate({
          to: "/login",
        });
        return { rows: [] as PostDTO[], nextOffset: 0 };
      }
      return { rows: (await response.json()) as PostDTO[], nextOffset: pageParam + 1 };
    },
    getNextPageParam: (_lastGroup, groups) => {
      if (!_lastGroup) {
        return 0;
      }
      if (_lastGroup.rows.length < POSTS_PER_PAGE) {
        return null;
      }
      return _lastGroup.nextOffset;
    },
    initialPageParam: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const postsAll = posts?.pages.flatMap((x: any) => x?.rows) ?? [];

  // console.log(postsAll, posts);

  const rowVirtualizer = useWindowVirtualizer({
    count: postsAll.length,
    scrollMargin: parentRef.current?.offsetTop ?? 0,
    estimateSize: () => 100,
    overscan: 3,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) {
      return;
    }

    if (lastItem.index >= postsAll.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, postsAll.length, isFetchingNextPage, rowVirtualizer.getVirtualItems()]);

  // console.log(rowVirtualizer.getVirtualItems(), postsAll, posts);

  return (
    <>
      <div
        ref={parentRef}
        className="List"
        style={{
          height: "100%",
          width: `100%`,
          overflow: "auto",
        }}
      >
        <div className="flex justify-center p-8 ">
          <div className="w-[600px] flex flex-col border-[-1px] border-grey-500">
            <Tabs
              defaultValue="all"
              onValueChange={(e) => {
                if (e === "followed") {
                  setOnlyFollowing(true);
                } else {
                  setOnlyFollowing(false);
                }
              }}
              className="mb-2"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">Dla ciebie</TabsTrigger>
                <TabsTrigger value="followed">Obserwowani</TabsTrigger>
              </TabsList>
            </Tabs>
            <AddPost />
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const isLoaderRow = virtualRow.index > postsAll.length - 1;
                const post = postsAll[virtualRow.index];
                return (
                  <div
                    key={virtualRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                    }}
                  >
                    {isLoaderRow ? (
                      hasNextPage ? (
                        "Ładowanie postów..."
                      ) : (
                        "To koniec :("
                      )
                    ) : (
                      <div ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
                        <Post short post={post} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const Route = createFileRoute("/_layout/")({
  component: Index,
  beforeLoad: () => {
    if (!document.cookie.includes("token")) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    }
  },
});
