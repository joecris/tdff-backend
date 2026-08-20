import { z } from 'zod';
import { GrandTour } from '../../../../domain/entities/grand-tour.entity';
import { formatDdMmYyyy } from '@shared/utils/date-format';
import { PaginatedResult } from '@shared/domain/pagination';
import { paginatedResponseSchema } from '@shared/http/pagination.dto';

export const grandTourResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.string().describe('DD-MM-YYYY').optional(),
  endDate: z.string().describe('DD-MM-YYYY').optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type GrandTourResponseDto = z.infer<typeof grandTourResponseSchema>;

export function toGrandTourResponseDto(grandTour: GrandTour): GrandTourResponseDto {
  return {
    id: grandTour.id,
    name: grandTour.name,
    ...(grandTour.description !== undefined ? { description: grandTour.description } : {}),
    ...(grandTour.startDate !== undefined
      ? { startDate: formatDdMmYyyy(grandTour.startDate) }
      : {}),
    ...(grandTour.endDate !== undefined ? { endDate: formatDdMmYyyy(grandTour.endDate) } : {}),
    createdAt: grandTour.createdAt.toISOString(),
    updatedAt: grandTour.updatedAt.toISOString(),
  };
}

export const paginatedGrandTourResponseSchema = paginatedResponseSchema(grandTourResponseSchema);
export type PaginatedGrandTourResponseDto = z.infer<typeof paginatedGrandTourResponseSchema>;

export function toPaginatedGrandTourResponseDto(
  result: PaginatedResult<GrandTour>,
): PaginatedGrandTourResponseDto {
  return { ...result, items: result.items.map(toGrandTourResponseDto) };
}
