import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { FantasyLeague } from '../../../domain/entities/fantasy-league.entity';
import { FantasyLeagueRepositoryPort } from '../../../domain/ports/fantasy-league-repository.port';
import { fantasyLeaguesTable } from '@infrastructure/db/schema/fantasy-league.schema';
import * as schema from '@infrastructure/db/schema';
import { FantasyLeagueMapper } from './mappers/fantasy-league.mapper';

export class DrizzleFantasyLeagueRepository implements FantasyLeagueRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findById(id: string): Promise<FantasyLeague | null> {
    const [row] = await this.db
      .select()
      .from(fantasyLeaguesTable)
      .where(eq(fantasyLeaguesTable.id, id))
      .limit(1);
    return row ? FantasyLeagueMapper.toDomain(row) : null;
  }

  async save(fantasyLeague: FantasyLeague): Promise<void> {
    const row = FantasyLeagueMapper.toPersistence(fantasyLeague);
    const { id, createdAt, ...updatableFields } = row;

    await this.db.insert(fantasyLeaguesTable).values(row).onConflictDoUpdate({
      target: fantasyLeaguesTable.id,
      set: updatableFields,
    });
  }
}
