import { SelectionSlot } from '@shared/domain/selection-slot';
import {
  Competition,
  CompetitionSlotConfig,
  CompetitionType,
} from '../entities/competition.entity';
import { CompetitionEntry } from '../entities/competition-entry.entity';
import { CompetitionResult } from '../entities/competition-result.entity';

export interface CreateCompetitionInput {
  name: string;
  description?: string;
  type: CompetitionType;
  fantasyLeagueId: string;
  entryLockAt?: Date;
  slots: CompetitionSlotConfig[];
}

export interface UpdateCompetitionSlotsInput {
  competitionId: string;
  slots: CompetitionSlotConfig[];
}

export interface SlotSelectionInput {
  slot: SelectionSlot;
  grandTourRiderId?: string;
  grandTourTeamId?: string;
}

export interface SubmitCompetitionEntryInput {
  competitionId: string;
  userId: string;
  selections: SlotSelectionInput[];
}

export interface SubmitCompetitionResultsInput {
  competitionId: string;
  submittedByUserId?: string;
  selections: SlotSelectionInput[];
}

export interface CompetitionServicePort {
  createCompetition(input: CreateCompetitionInput): Promise<Competition>;
  getCompetitionById(id: string): Promise<Competition>;
  /** Rejects with `CompetitionResultsAlreadySubmittedError` once a result
   * exists — reshaping required slots/points after scoring has happened
   * would silently invalidate already-computed scores. */
  updateCompetitionSlots(input: UpdateCompetitionSlotsInput): Promise<Competition>;
  /** Upsert — creates the user's first entry, or replaces it if one already exists. */
  submitEntry(input: SubmitCompetitionEntryInput): Promise<CompetitionEntry>;
  getMyEntry(competitionId: string, userId: string): Promise<CompetitionEntry>;
  listEntries(competitionId: string): Promise<CompetitionEntry[]>;
  /** Upsert — same full-replace semantics as `submitEntry`. Triggers score recalculation. */
  submitResults(input: SubmitCompetitionResultsInput): Promise<CompetitionResult>;
}
