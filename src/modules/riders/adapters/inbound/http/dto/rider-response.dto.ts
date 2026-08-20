import { z } from 'zod';
import { Rider } from '../../../../domain/entities/rider.entity';
import { PaginatedResult } from '@shared/domain/pagination';
import { paginatedResponseSchema } from '@shared/http/pagination.dto';

export const riderResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  nationality: z.string().optional(),
  imageUrl: z.string().optional(),
  type: z.string().optional(),
  teamId: z.uuid().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type RiderResponseDto = z.infer<typeof riderResponseSchema>;

export function toRiderResponseDto(rider: Rider): RiderResponseDto {
  return {
    id: rider.id,
    name: rider.name,
    ...(rider.nationality !== undefined ? { nationality: rider.nationality } : {}),
    ...(rider.imageUrl !== undefined ? { imageUrl: rider.imageUrl } : {}),
    ...(rider.type !== undefined ? { type: rider.type } : {}),
    ...(rider.teamId !== undefined ? { teamId: rider.teamId } : {}),
    createdAt: rider.createdAt.toISOString(),
    updatedAt: rider.updatedAt.toISOString(),
  };
}

export const paginatedRiderResponseSchema = paginatedResponseSchema(riderResponseSchema);
export type PaginatedRiderResponseDto = z.infer<typeof paginatedRiderResponseSchema>;

export function toPaginatedRiderResponseDto(
  result: PaginatedResult<Rider>,
): PaginatedRiderResponseDto {
  return { ...result, items: result.items.map(toRiderResponseDto) };
}
