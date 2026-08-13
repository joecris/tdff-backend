CREATE TYPE "public"."fantasy_league_member_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TABLE "grand_tour_teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grand_tour_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grand_tour_riders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grand_tour_id" uuid NOT NULL,
	"rider_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy_leagues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"grand_tour_id" uuid NOT NULL,
	"start_date" date,
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy_league_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fantasy_league_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "fantasy_league_member_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grand_tour_teams" ADD CONSTRAINT "grand_tour_teams_grand_tour_id_grand_tours_id_fk" FOREIGN KEY ("grand_tour_id") REFERENCES "public"."grand_tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grand_tour_teams" ADD CONSTRAINT "grand_tour_teams_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grand_tour_riders" ADD CONSTRAINT "grand_tour_riders_grand_tour_id_grand_tours_id_fk" FOREIGN KEY ("grand_tour_id") REFERENCES "public"."grand_tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grand_tour_riders" ADD CONSTRAINT "grand_tour_riders_rider_id_riders_id_fk" FOREIGN KEY ("rider_id") REFERENCES "public"."riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_leagues" ADD CONSTRAINT "fantasy_leagues_grand_tour_id_grand_tours_id_fk" FOREIGN KEY ("grand_tour_id") REFERENCES "public"."grand_tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_league_members" ADD CONSTRAINT "fantasy_league_members_fantasy_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("fantasy_league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_league_members" ADD CONSTRAINT "fantasy_league_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "grand_tour_teams_grand_tour_id_team_id_idx" ON "grand_tour_teams" USING btree ("grand_tour_id","team_id");--> statement-breakpoint
CREATE INDEX "grand_tour_teams_team_id_idx" ON "grand_tour_teams" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "grand_tour_riders_grand_tour_id_rider_id_idx" ON "grand_tour_riders" USING btree ("grand_tour_id","rider_id");--> statement-breakpoint
CREATE INDEX "grand_tour_riders_rider_id_idx" ON "grand_tour_riders" USING btree ("rider_id");--> statement-breakpoint
CREATE INDEX "fantasy_leagues_grand_tour_id_idx" ON "fantasy_leagues" USING btree ("grand_tour_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fantasy_league_members_league_id_user_id_idx" ON "fantasy_league_members" USING btree ("fantasy_league_id","user_id");--> statement-breakpoint
CREATE INDEX "fantasy_league_members_user_id_idx" ON "fantasy_league_members" USING btree ("user_id");