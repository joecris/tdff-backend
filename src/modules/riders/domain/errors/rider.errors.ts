import { NotFoundError } from '@shared/errors/app-error';

export class RiderNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Rider with id "${id}" was not found`);
  }
}
