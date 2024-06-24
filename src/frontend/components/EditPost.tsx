import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PostDTO } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "./ui/textarea";
import { fetchApi } from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";

const EditPost = ({ post }: { post: PostDTO }) => {
  const [content, setContent] = React.useState(post.content);
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  const handleEdit = async () => {
    await fetchApi(`/api/posts/${post.id}`, router, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    setIsOpen(false);
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="p-2 m-1 dark:hover:bg-zinc-900 light:hover:bg-zinc-50 cursor-pointer rounded-full w-[20px] h-[20px] box-content">
          {/* @ts-ignore */}
          <ion-icon style={{ fontSize: 20 }} name="create-outline"></ion-icon>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edytuj wpis</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="col-span-3" />
        </div>
        <DialogFooter>
          <Button onClick={handleEdit}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPost;
