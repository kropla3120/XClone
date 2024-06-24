import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchApi } from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";

const AddPost = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get("content") as string;
    const res = await fetchApi("/api/posts", router, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (res?.status === 400) {
      const { error } = await res.json();
      toast.error(
        <div>
          {error.split("\n").map((e: string) => (
            <p>{e}</p>
          ))}
        </div>
      );
      return;
    }

    (e.target as HTMLFormElement).reset();

    queryClient.invalidateQueries({
      queryKey: ["posts"],
    });
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 w-full border border-grey-500 p-4">
        <Textarea className="w-full" placeholder="Co się dzieje?!" name="content" />
        <Button className="w-full" variant="default" size="default" type="submit">
          Dodaj post
        </Button>
      </div>
    </form>
  );
};

export default AddPost;
