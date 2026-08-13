import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Team } from '../../../domain/entities/team.entity';
import { TeamRepositoryPort } from '../../../domain/ports/team-repository.port';
import { teamsTable } from '@infrastructure/db/schema/team.schema';
import * as schema from '@infrastructure/db/schema';
import { TeamMapper } from './mappers/team.mapper';

export class DrizzleTeamRepository implements TeamRepositoryPort {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findById(id: string): Promise<Team | null> {
    const [row] = await this.db.select().from(teamsTable).where(eq(teamsTable.id, id)).limit(1);
    return row ? TeamMapper.toDomain(row) : null;
  }

  async findByName(name: string): Promise<Team | null> {
    const [row] = await this.db
      .select()
      .from(teamsTable)
      .where(eq(teamsTable.name, name.trim()))
      .limit(1);
    return row ? TeamMapper.toDomain(row) : null;
  }

  async save(team: Team): Promise<void> {
    const row = TeamMapper.toPersistence(team);
    const { id, createdAt, ...updatableFields } = row;

    await this.db.insert(teamsTable).values(row).onConflictDoUpdate({
      target: teamsTable.id,
      set: updatableFields,
    });
  }
}
