ALTER TABLE "posts" DROP CONSTRAINT "posts_responseToPostId_posts_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_responseToPostId_posts_id_fk" FOREIGN KEY ("responseToPostId") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
