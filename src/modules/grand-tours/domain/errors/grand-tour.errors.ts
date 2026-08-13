import { ConflictError, NotFoundError, ValidationError } from '@shared/errors/app-error';

export class GrandTourNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Grand Tour with id "${id}" was not found`);
  }
}

export class InvalidTourDateRangeError extends ValidationError {
  constructor() {
    super('endDate must not be before startDate');
  }
}

export class TeamAlreadyInGrandTourError extends ConflictError {
  constructor(grandTourId: string, teamId: string) {
    super(`Team "${teamId}" is already on the start list for grand tour "${grandTourId}"`);
  }
}

export class RiderAlreadyInGrandTourError extends ConflictError {
  constructor(grandTourId: string, riderId: string) {
    super(`Rider "${riderId}" is already on the start list for grand tour "${grandTourId}"`);
  }
}

export class GrandTourTeamNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Grand tour team participation with id "${id}" was not found`);
  }
}

export class GrandTourRiderNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Grand tour rider participation with id "${id}" was not found`);
  }
}
