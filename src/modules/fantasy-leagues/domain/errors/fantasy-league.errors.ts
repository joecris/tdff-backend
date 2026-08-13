import { ConflictError, NotFoundError, ValidationError } from '@shared/errors/app-error';

export class FantasyLeagueNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Fantasy League with id "${id}" was not found`);
  }
}

export class InvalidFantasyLeagueDateRangeError extends ValidationError {
  constructor() {
    super('endDate must not be before startDate');
  }
}

export class AlreadyMemberError extends ConflictError {
  constructor(fantasyLeagueId: string, userId: string) {
    super(`User "${userId}" is already a member of fantasy league "${fantasyLeagueId}"`);
  }
}
