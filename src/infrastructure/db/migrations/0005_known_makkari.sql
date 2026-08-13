CREATE TABLE "competition_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"submitted_by_user_id" uuid,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competition_results_competition_id_unique" UNIQUE("competition_id")
);
--> statement-breakpoint
CREATE TABLE "competition_result_selections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"result_id" uuid NOT NULL,
	"slot" varchar(30) NOT NULL,
	"grand_tour_rider_id" uuid,
	"grand_tour_team_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competition_result_selections_exactly_one_pick" CHECK (("competition_result_selections"."grand_tour_rider_id" is not null) != ("competition_result_selections"."grand_tour_team_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "competition_entry_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"competition_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"calculated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competition_entry_scores_entry_id_unique" UNIQUE("entry_id")
);
--> statement-breakpoint
CREATE TABLE "league_leaderboard_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fantasy_league_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"rank" integer NOT NULL,
	"calculated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "competition_results" ADD CONSTRAINT "competition_results_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_results" ADD CONSTRAINT "competition_results_submitted_by_user_id_users_id_fk" FOREIGN KEY ("submitted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_result_selections" ADD CONSTRAINT "competition_result_selections_result_id_competition_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."competition_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_result_selections" ADD CONSTRAINT "competition_result_selections_grand_tour_rider_id_grand_tour_riders_id_fk" FOREIGN KEY ("grand_tour_rider_id") REFERENCES "public"."grand_tour_riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_result_selections" ADD CONSTRAINT "competition_result_selections_grand_tour_team_id_grand_tour_teams_id_fk" FOREIGN KEY ("grand_tour_team_id") REFERENCES "public"."grand_tour_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_entry_scores" ADD CONSTRAINT "competition_entry_scores_entry_id_competition_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."competition_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_entry_scores" ADD CONSTRAINT "competition_entry_scores_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_entry_scores" ADD CONSTRAINT "competition_entry_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_leaderboard_entries" ADD CONSTRAINT "league_leaderboard_entries_fantasy_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("fantasy_league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_leaderboard_entries" ADD CONSTRAINT "league_leaderboard_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "competition_result_selections_result_id_slot_idx" ON "competition_result_selections" USING btree ("result_id","slot");--> statement-breakpoint
CREATE INDEX "competition_result_selections_grand_tour_rider_id_idx" ON "competition_result_selections" USING btree ("grand_tour_rider_id");--> statement-breakpoint
CREATE INDEX "competition_result_selections_grand_tour_team_id_idx" ON "competition_result_selections" USING btree ("grand_tour_team_id");--> statement-breakpoint
CREATE INDEX "competition_entry_scores_competition_id_idx" ON "competition_entry_scores" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "competition_entry_scores_user_id_idx" ON "competition_entry_scores" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "league_leaderboard_entries_league_id_user_id_idx" ON "league_leaderboard_entries" USING btree ("fantasy_league_id","user_id");--> statement-breakpoint
CREATE INDEX "league_leaderboard_entries_fantasy_league_id_idx" ON "league_leaderboard_entries" USING btree ("fantasy_league_id");