import { Competition } from '@modules/competitions/domain/entities/competition.entity';
import { CompetitionRepositoryPort } from '@modules/competitions/domain/ports/competition-repository.port';

export class FakeCompetitionRepository implements CompetitionRepositoryPort {
  private readonly competitionsById = new Map<string, Competition>();

  async findById(id: string): Promise<Competition | null> {
    return this.competitionsById.get(id) ?? null;
  }

  async save(competition: Competition): Promise<void> {
    this.competitionsById.set(competition.id, competition);
  }
}
