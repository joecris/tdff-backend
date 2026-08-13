import { NotFoundError } from '@shared/errors/app-error';

export class TeamNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Team with id "${id}" was not found`);
  }
}
