import { ConflictError, NotFoundError, ValidationError } from '@shared/errors/app-error';
import { SelectionSlot } from '@shared/domain/selection-slot';

export class CompetitionNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Competition with id "${id}" was not found`);
  }
}

export class EmptyCompetitionSlotsError extends ValidationError {
  constructor() {
    super('A competition must define at least one required slot');
  }
}

export class DuplicateCompetitionSlotError extends ValidationError {
  constructor(slot: string) {
    super(`Competition slot config contains slot "${slot}" more than once`);
  }
}

export class InvalidSlotPointsError extends ValidationError {
  constructor(slot: string, points: number) {
    super(`Points for slot "${slot}" must be a positive integer, got ${points}`);
  }
}

export class CompetitionResultsAlreadySubmittedError extends ConflictError {
  constructor(competitionId: string) {
    super(
      `Competition "${competitionId}" already has results submitted — its slot config can no longer be changed`,
    );
  }
}

export class CompetitionEntryNotFoundError extends NotFoundError {
  constructor(competitionId: string, userId: string) {
    super(`No entry found for user "${userId}" in competition "${competitionId}"`);
  }
}

export class InvalidEntrySelectionsError extends ValidationError {
  constructor(missing: SelectionSlot[], unexpected: string[]) {
    const parts: string[] = [];
    if (missing.length > 0) parts.push(`missing required slot(s): ${missing.join(', ')}`);
    if (unexpected.length > 0) parts.push(`unexpected slot(s): ${unexpected.join(', ')}`);
    super(`Entry selections are invalid — ${parts.join('; ')}`);
  }
}

export class DuplicateEntrySlotError extends ValidationError {
  constructor(slot: string) {
    super(`Entry selections contain slot "${slot}" more than once`);
  }
}

export class InvalidSelectionPickError extends ValidationError {
  constructor(slot: string) {
    super(
      `Selection for slot "${slot}" must reference exactly one of a rider or a team, not zero or both`,
    );
  }
}

export class RiderNotInGrandTourError extends ValidationError {
  constructor(grandTourRiderId: string) {
    super(`Rider selection "${grandTourRiderId}" does not belong to this competition's grand tour`);
  }
}

export class TeamNotInGrandTourError extends ValidationError {
  constructor(grandTourTeamId: string) {
    super(`Team selection "${grandTourTeamId}" does not belong to this competition's grand tour`);
  }
}

export class InvalidResultSelectionsError extends ValidationError {
  constructor(missing: SelectionSlot[], unexpected: string[]) {
    const parts: string[] = [];
    if (missing.length > 0) parts.push(`missing required slot(s): ${missing.join(', ')}`);
    if (unexpected.length > 0) parts.push(`unexpected slot(s): ${unexpected.join(', ')}`);
    super(`Result selections are invalid — ${parts.join('; ')}`);
  }
}

export class DuplicateResultSlotError extends ValidationError {
  constructor(slot: string) {
    super(`Result selections contain slot "${slot}" more than once`);
  }
}
