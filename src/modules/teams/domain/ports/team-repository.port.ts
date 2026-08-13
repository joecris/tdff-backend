import { Team } from '../entities/team.entity';

/**
 * Outbound port. The application layer depends on this interface only;
 * `adapters/outbound/persistence/drizzle-team.repository.ts` implements it.
 *
 * `findByName` exists for the Phase 5 Excel bulk-import feature (matching
 * a spreadsheet row's team name against an existing team) — not used by
 * any use case yet in this phase, but part of the port from the start so
 * the Drizzle adapter and its tests cover it now rather than later.
 */
export interface TeamRepositoryPort {
  findById(id: string): Promise<Team | null>;
  findByName(name: string): Promise<Team | null>;
  save(team: Team): Promise<void>;
}
