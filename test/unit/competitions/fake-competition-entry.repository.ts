import { CompetitionEntry } from '@modules/competitions/domain/entities/competition-entry.entity';
import { CompetitionEntryRepositoryPort } from '@modules/competitions/domain/ports/competition-entry-repository.port';

export class FakeCompetitionEntryRepository implements CompetitionEntryRepositoryPort {
  private readonly entriesById = new Map<string, CompetitionEntry>();

  async findByCompetitionAndUser(
    competitionId: string,
    userId: string,
  ): Promise<CompetitionEntry | null> {
    for (const entry of this.entriesById.values()) {
      if (entry.competitionId === competitionId && entry.userId === userId) return entry;
    }
    return null;
  }

  async listByCompetition(competitionId: string): Promise<CompetitionEntry[]> {
    return [...this.entriesById.values()].filter((e) => e.competitionId === competitionId);
  }

  async save(entry: CompetitionEntry): Promise<void> {
    this.entriesById.set(entry.id, entry);
  }
}
