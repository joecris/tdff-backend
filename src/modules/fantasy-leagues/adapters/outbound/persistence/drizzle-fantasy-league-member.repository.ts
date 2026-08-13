import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { FantasyLeagueMember } from '../../../domain/entities/fantasy-league-member.entity';
import { FantasyLeagueMemberRepositoryPort } from '../../../domain/ports/fantasy-league-member-repository.port';
import { fantasyLeagueMembersTable } from '@infrastructure/db/schema/fantasy-league-member.schema';
import * as schema from '@infrastructure/db/schema';
import { FantasyLeagueMemberMapper } from './mappers/fantasy-league-member.mapper';

export class DrizzleFantasyLeagueMemberRepository implements FantasyLeagueMemberRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findByLeagueAndUser(
    fantasyLeagueId: string,
    userId: string,
  ): Promise<FantasyLeagueMember | null> {
    const [row] = await this.db
      .select()
      .from(fantasyLeagueMembersTable)
      .where(
        and(
          eq(fantasyLeagueMembersTable.fantasyLeagueId, fantasyLeagueId),
          eq(fantasyLeagueMembersTable.userId, userId),
        ),
      )
      .limit(1);

    return row ? FantasyLeagueMemberMapper.toDomain(row) : null;
  }

  async listByLeague(fantasyLeagueId: string): Promise<FantasyLeagueMember[]> {
    const rows = await this.db
      .select()
      .from(fantasyLeagueMembersTable)
      .where(eq(fantasyLeagueMembersTable.fantasyLeagueId, fantasyLeagueId));

    return rows.map(FantasyLeagueMemberMapper.toDomain);
  }

  async save(member: FantasyLeagueMember): Promise<void> {
    const row = FantasyLeagueMemberMapper.toPersistence(member);
    const { id, createdAt, ...updatableFields } = row;

    await this.db.insert(fantasyLeagueMembersTable).values(row).onConflictDoUpdate({
      target: fantasyLeagueMembersTable.id,
      set: updatableFields,
    });
  }
}
