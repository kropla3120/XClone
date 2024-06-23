import React, { useContext } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { PostDTO } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/context";
import { Textarea } from "./ui/textarea";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

const DeletePost = ({ post, isInPostDetails }: { post: PostDTO; isInPostDetails?: boolean }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const handleDelete = async () => {
    await fetch(`/api/posts/${post.id}`, {
      method: "DELETE",
    });
    setIsOpen(false);
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Usunięto post");
    if (isInPostDetails) {
      router.navigate({
        to: "/",
      });
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="p-2 m-1 dark:hover:bg-zinc-900 light:hover:bg-zinc-50 cursor-pointer rounded-full w-[20px] h-[20px] box-content">
          {/* @ts-ignore */}
          <ion-icon style={{ fontSize: 20 }} name="trash-outline"></ion-icon>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Czy na pewno chcesz usunąć post ?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant={"destructive"} onClick={handleDelete}>
            Usuń
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePost;
