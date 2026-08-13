import { FantasyLeagueServicePort } from '@modules/fantasy-leagues/domain/ports/fantasy-league-service.port';
import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';
import { User } from '@modules/user/domain/entities/user.entity';

export async function seedFantasyLeagueMembers(
  fantasyLeagueService: FantasyLeagueServicePort,
  fantasyLeagues: FantasyLeague[],
  users: User[],
): Promise<void> {
  const league = fantasyLeagues[0];
  if (!league) return;

  for (const user of users) {
    const member = await fantasyLeagueService.joinFantasyLeague({
      fantasyLeagueId: league.id,
      userId: user.id,
    });
    console.warn(`  ✓ "${user.email}" joined "${league.name}" as ${member.role}`);
  }
}
