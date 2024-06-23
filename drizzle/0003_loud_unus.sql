CREATE TABLE IF NOT EXISTS "followers" (
	"id" serial PRIMARY KEY NOT NULL,
	"followerId" integer NOT NULL,
	"followingId" integer NOT NULL,
	CONSTRAINT "followers_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_followerId_users_id_fk" FOREIGN KEY ("followerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "followers" ADD CONSTRAINT "followers_followingId_users_id_fk" FOREIGN KEY ("followingId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
