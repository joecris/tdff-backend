import { GrandTourTeam } from '../entities/grand-tour-team.entity';

export interface GrandTourTeamRepositoryPort {
  findById(id: string): Promise<GrandTourTeam | null>;
  findByGrandTourAndTeam(grandTourId: string, teamId: string): Promise<GrandTourTeam | null>;
  listByGrandTour(grandTourId: string): Promise<GrandTourTeam[]>;
  save(grandTourTeam: GrandTourTeam): Promise<void>;
}
