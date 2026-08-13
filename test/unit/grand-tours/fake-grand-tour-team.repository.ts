import { GrandTourTeam } from '@modules/grand-tours/domain/entities/grand-tour-team.entity';
import { GrandTourTeamRepositoryPort } from '@modules/grand-tours/domain/ports/grand-tour-team-repository.port';

export class FakeGrandTourTeamRepository implements GrandTourTeamRepositoryPort {
  private readonly rows: GrandTourTeam[] = [];

  async findById(id: string): Promise<GrandTourTeam | null> {
    return this.rows.find((r) => r.id === id) ?? null;
  }

  async findByGrandTourAndTeam(grandTourId: string, teamId: string): Promise<GrandTourTeam | null> {
    return this.rows.find((r) => r.grandTourId === grandTourId && r.teamId === teamId) ?? null;
  }

  async listByGrandTour(grandTourId: string): Promise<GrandTourTeam[]> {
    return this.rows.filter((r) => r.grandTourId === grandTourId);
  }

  async save(grandTourTeam: GrandTourTeam): Promise<void> {
    this.rows.push(grandTourTeam);
  }
}
