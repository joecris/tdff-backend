import { ConflictError, NotFoundError } from '@shared/errors/app-error';

export class UserNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`User with id "${id}" was not found`);
  }
}

export class EmailAlreadyInUseError extends ConflictError {
  constructor(email: string) {
    super(`Email "${email}" is already in use`);
  }
}
