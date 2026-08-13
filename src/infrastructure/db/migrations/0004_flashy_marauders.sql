CREATE TYPE "public"."competition_type" AS ENUM('general_classification', 'points', 'mountains', 'young_rider', 'custom');--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"type" "competition_type" NOT NULL,
	"fantasy_league_id" uuid NOT NULL,
	"entry_lock_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competition_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competition_entry_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"slot" varchar(30) NOT NULL,
	"grand_tour_rider_id" uuid,
	"grand_tour_team_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competition_entry_selections_exactly_one_pick" CHECK (("competition_entry_selections"."grand_tour_rider_id" is not null) != ("competition_entry_selections"."grand_tour_team_id" is not null))
);
--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_fantasy_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("fantasy_league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_entries" ADD CONSTRAINT "competition_entries_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_entries" ADD CONSTRAINT "competition_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_entry_selections" ADD CONSTRAINT "competition_entry_selections_entry_id_competition_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."competition_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_entry_selections" ADD CONSTRAINT "competition_entry_selections_grand_tour_rider_id_grand_tour_riders_id_fk" FOREIGN KEY ("grand_tour_rider_id") REFERENCES "public"."grand_tour_riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_entry_selections" ADD CONSTRAINT "competition_entry_selections_grand_tour_team_id_grand_tour_teams_id_fk" FOREIGN KEY ("grand_tour_team_id") REFERENCES "public"."grand_tour_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "competitions_fantasy_league_id_idx" ON "competitions" USING btree ("fantasy_league_id");--> statement-breakpoint
CREATE UNIQUE INDEX "competition_entries_competition_id_user_id_idx" ON "competition_entries" USING btree ("competition_id","user_id");--> statement-breakpoint
CREATE INDEX "competition_entries_user_id_idx" ON "competition_entries" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "competition_entry_selections_entry_id_slot_idx" ON "competition_entry_selections" USING btree ("entry_id","slot");--> statement-breakpoint
CREATE INDEX "competition_entry_selections_grand_tour_rider_id_idx" ON "competition_entry_selections" USING btree ("grand_tour_rider_id");--> statement-breakpoint
CREATE INDEX "competition_entry_selections_grand_tour_team_id_idx" ON "competition_entry_selections" USING btree ("grand_tour_team_id");