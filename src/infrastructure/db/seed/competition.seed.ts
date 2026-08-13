import {
  CompetitionServicePort,
  CreateCompetitionInput,
} from '@modules/competitions/domain/ports/competition-service.port';
import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';

/**
 * Competitions only — no sample entries. Submitting an entry is a user
 * action best exercised via a live request (see the module's README/PR
 * notes), not baked into demo data; keeps this seeder from having to fake
 * up plausible grand-tour-rider/team references for every slot.
 *
 * Doubles as living documentation of Phase 4.5's admin-configurable
 * `slots` shape — each competition below is one of the product's real
 * types. Note GC Top 3 and KOM Top 3 reuse the exact same slot names
 * (`top_1`/`top_2`/`top_3`) at DIFFERENT point values, and the two Stage
 * Winner rows show the same `type` used for both the winner-only and
 * top-3 variants — both are the actual bug this phase fixes: slots/points
 * are per competition instance, never derived from `type`.
 */
export async function seedCompetitions(
  competitionService: CompetitionServicePort,
  fantasyLeagues: FantasyLeague[],
): Promise<void> {
  const league = fantasyLeagues[0];
  if (!league) return;

  const sampleCompetitions: CreateCompetitionInput[] = [
    {
      name: 'General Classification — Top 3',
      description: 'Pick who finishes 1st, 2nd, and 3rd overall.',
      type: 'gc_top3',
      fantasyLeagueId: league.id,
      slots: [
        { slot: 'top_1', points: 10 },
        { slot: 'top_2', points: 7 },
        { slot: 'top_3', points: 5 },
      ],
    },
    {
      name: 'King of the Mountain — Top 3',
      description: 'Pick who finishes 1st, 2nd, and 3rd in the mountains classification.',
      type: 'kom_top3',
      fantasyLeagueId: league.id,
      // Same slot names as GC Top 3 above, deliberately different points —
      // proves points are per-competition, not per-slot-name globally.
      slots: [
        { slot: 'top_1', points: 8 },
        { slot: 'top_2', points: 5 },
        { slot: 'top_3', points: 3 },
      ],
    },
    {
      name: 'Fantasy Team',
      description: 'Build your team: one climber, one sprinter, one rouleur, one puncheur.',
      type: 'fantasy_team',
      fantasyLeagueId: league.id,
      slots: [
        { slot: 'climber', points: 10 },
        { slot: 'sprinter', points: 10 },
        { slot: 'rouleur', points: 8 },
        { slot: 'puncheur', points: 8 },
      ],
    },
    {
      name: 'Overall Team',
      description: 'Pick the team you think will finish with the best overall result.',
      type: 'overall_team',
      fantasyLeagueId: league.id,
      slots: [{ slot: 'overall_team', points: 5 }],
    },
    {
      name: 'Stage 1 — Winner',
      description: 'Pick the winner of stage 1.',
      type: 'stage_winner',
      fantasyLeagueId: league.id,
      slots: [{ slot: 'top_1', points: 5 }],
    },
    {
      name: 'Stage 2 — Podium',
      description: 'Pick the top 3 finishers of stage 2 — same "stage_winner" type as Stage 1, different slot config.',
      type: 'stage_winner',
      fantasyLeagueId: league.id,
      slots: [
        { slot: 'top_1', points: 5 },
        { slot: 'top_2', points: 3 },
        { slot: 'top_3', points: 2 },
      ],
    },
  ];

  for (const input of sampleCompetitions) {
    const competition = await competitionService.createCompetition(input);
    console.warn(`  ✓ created competition "${competition.name}" (${competition.type})`);
  }
}
