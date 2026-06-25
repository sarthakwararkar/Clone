CREATE TABLE IF NOT EXISTS "youtube_commentators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"youtube_handle" text,
	"avatar_url" text,
	"channel_url" text,
	"comment_text" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
