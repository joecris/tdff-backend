import { GrandTourTeam } from '../entities/grand-tour-team.entity';
import { GrandTourRider } from '../entities/grand-tour-rider.entity';

export interface AddTeamToGrandTourInput {
  grandTourId: string;
  teamId: string;
}

export interface AddRiderToGrandTourInput {
  grandTourId: string;
  riderId: string;
}

/**
 * Separate inbound port from `GrandTourServicePort` deliberately — start-list
 * management (teams/riders racing in a grand tour) is a distinct concern
 * from grand tour CRUD itself, even though both live in this module. Keeps
 * each port focused instead of one growing interface for everything the
 * module does.
 */
export interface GrandTourParticipationServicePort {
  addTeam(input: AddTeamToGrandTourInput): Promise<GrandTourTeam>;
  addRider(input: AddRiderToGrandTourInput): Promise<GrandTourRider>;
  listTeams(grandTourId: string): Promise<GrandTourTeam[]>;
  listRiders(grandTourId: string): Promise<GrandTourRider[]>;
  // Resolve a start-list row by its own id — used cross-module (e.g. by
  // `competitions`) to confirm a referenced rider/team is actually racing
  // in the expected grand tour, without depending on how it's persisted.
  getGrandTourTeamById(id: string): Promise<GrandTourTeam>;
  getGrandTourRiderById(id: string): Promise<GrandTourRider>;
}
