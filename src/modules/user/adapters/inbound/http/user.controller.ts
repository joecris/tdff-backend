import { RequestHandler } from 'express';
import { UserServicePort } from '../../../domain/ports/user-service.port';
import { PaginationParams } from '@shared/domain/pagination';
import { CreateUserDto } from './dto/create-user.dto';
import { toUserResponseDto, toPaginatedUserResponseDto } from './dto/user-response.dto';

/**
 * Inbound HTTP adapter. Depends only on the UserServicePort interface —
 * knows nothing about Drizzle or how the use cases are implemented.
 * Translates HTTP <-> domain calls; no business logic lives here.
 */
export class UserController {
  constructor(private readonly userService: UserServicePort) {}

  create: RequestHandler = async (req, res, next) => {
    try {
      const dto = req.body as CreateUserDto;
      const user = await this.userService.createUser(dto);
      res.status(201).json(toUserResponseDto(user));
    } catch (err) {
      next(err);
    }
  };

  getById: RequestHandler = async (req, res, next) => {
    try {
      const user = await this.userService.getUserById(req.params.id as string);
      res.status(200).json(toUserResponseDto(user));
    } catch (err) {
      next(err);
    }
  };

  // `req.pagination` is set by `validateQuery(paginationQuerySchema)`,
  // which always runs before this handler on the route — same "trust the
  // router" reasoning as `req.params.id as string` above.
  list: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.userService.listUsers(req.pagination as PaginationParams);
      res.status(200).json(toPaginatedUserResponseDto(result));
    } catch (err) {
      next(err);
    }
  };
}
