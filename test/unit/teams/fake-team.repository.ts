import { Team } from '@modules/teams/domain/entities/team.entity';
import { TeamRepositoryPort } from '@modules/teams/domain/ports/team-repository.port';
import { PaginationParams } from '@shared/domain/pagination';
import { paginateFake } from '../shared/paginate-fake';

export class FakeTeamRepository implements TeamRepositoryPort {
  private readonly teamsById = new Map<string, Team>();

  async findById(id: string): Promise<Team | null> {
    return this.teamsById.get(id) ?? null;
  }

  async findByName(name: string): Promise<Team | null> {
    for (const team of this.teamsById.values()) {
      if (team.name === name.trim()) return team;
    }
    return null;
  }

  async findMany(params: PaginationParams): Promise<{ items: Team[]; total: number }> {
    return paginateFake([...this.teamsById.values()], params, (t) => t.createdAt);
  }

  async save(team: Team): Promise<void> {
    this.teamsById.set(team.id, team);
  }
}
