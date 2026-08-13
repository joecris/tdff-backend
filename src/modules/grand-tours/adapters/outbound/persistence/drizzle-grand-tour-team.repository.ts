import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { GrandTourTeam } from '../../../domain/entities/grand-tour-team.entity';
import { GrandTourTeamRepositoryPort } from '../../../domain/ports/grand-tour-team-repository.port';
import { grandTourTeamsTable } from '@infrastructure/db/schema/grand-tour-team.schema';
import * as schema from '@infrastructure/db/schema';
import { GrandTourTeamMapper } from './mappers/grand-tour-team.mapper';

export class DrizzleGrandTourTeamRepository implements GrandTourTeamRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findById(id: string): Promise<GrandTourTeam | null> {
    const [row] = await this.db
      .select()
      .from(grandTourTeamsTable)
      .where(eq(grandTourTeamsTable.id, id))
      .limit(1);
    return row ? GrandTourTeamMapper.toDomain(row) : null;
  }

  async findByGrandTourAndTeam(grandTourId: string, teamId: string): Promise<GrandTourTeam | null> {
    const [row] = await this.db
      .select()
      .from(grandTourTeamsTable)
      .where(
        and(
          eq(grandTourTeamsTable.grandTourId, grandTourId),
          eq(grandTourTeamsTable.teamId, teamId),
        ),
      )
      .limit(1);

    return row ? GrandTourTeamMapper.toDomain(row) : null;
  }

  async listByGrandTour(grandTourId: string): Promise<GrandTourTeam[]> {
    const rows = await this.db
      .select()
      .from(grandTourTeamsTable)
      .where(eq(grandTourTeamsTable.grandTourId, grandTourId));

    return rows.map(GrandTourTeamMapper.toDomain);
  }

  async save(grandTourTeam: GrandTourTeam): Promise<void> {
    const row = GrandTourTeamMapper.toPersistence(grandTourTeam);
    const { id, createdAt, ...updatableFields } = row;

    await this.db.insert(grandTourTeamsTable).values(row).onConflictDoUpdate({
      target: grandTourTeamsTable.id,
      set: updatableFields,
    });
  }
}
