import { z } from 'zod';
import { GrandTourRider } from '../../../../domain/entities/grand-tour-rider.entity';

export const grandTourRiderResponseSchema = z.object({
  id: z.uuid(),
  grandTourId: z.uuid(),
  riderId: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type GrandTourRiderResponseDto = z.infer<typeof grandTourRiderResponseSchema>;

export function toGrandTourRiderResponseDto(
  grandTourRider: GrandTourRider,
): GrandTourRiderResponseDto {
  return {
    id: grandTourRider.id,
    grandTourId: grandTourRider.grandTourId,
    riderId: grandTourRider.riderId,
    createdAt: grandTourRider.createdAt.toISOString(),
    updatedAt: grandTourRider.updatedAt.toISOString(),
  };
}
