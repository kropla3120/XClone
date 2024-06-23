DROP TABLE "comments";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "responseTo" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_responseTo_posts_id_fk" FOREIGN KEY ("responseTo") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "title";