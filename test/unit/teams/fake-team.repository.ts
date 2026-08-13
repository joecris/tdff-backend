import { Team } from '@modules/teams/domain/entities/team.entity';
import { TeamRepositoryPort } from '@modules/teams/domain/ports/team-repository.port';

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

  async save(team: Team): Promise<void> {
    this.teamsById.set(team.id, team);
  }
}
