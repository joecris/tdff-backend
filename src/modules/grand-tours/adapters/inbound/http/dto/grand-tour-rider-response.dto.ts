import { GrandTourRider } from '../../../../domain/entities/grand-tour-rider.entity';

export interface GrandTourRiderResponseDto {
  id: string;
  grandTourId: string;
  riderId: string;
  createdAt: string;
  updatedAt: string;
}

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
