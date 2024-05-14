import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PostDTO } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

const EditPost = ({ post }: { post: PostDTO }) => {
  const [title, setTitle] = React.useState(post.title);
  const [content, setContent] = React.useState(post.content);
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const handleEdit = async () => {
    await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
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
          <div>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div>
            {/* <Label htmlFor="username" className="text-right">
                  Username
                </Label> */}
            <Input id="content" value={content} onChange={(e) => setContent(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleEdit}>Zapisz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPost;
