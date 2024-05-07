import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useQueryClient } from "@tanstack/react-query";

const AddPost = () => {
  const queryClient = useQueryClient();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });
    (e.target as HTMLFormElement).reset();

    queryClient.invalidateQueries({
      queryKey: ["posts"],
    });
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 w-full border border-grey-500 p-4">
        <Input className="w-full" type="text" placeholder="Tytuł" name="title" />
        <Textarea className="w-full" placeholder="Co się dzieje?!" name="content" />
        <Button className="w-full" variant="default" size="default" type="submit">
          Dodaj post
        </Button>
      </div>
    </form>
  );
};

export default AddPost;
