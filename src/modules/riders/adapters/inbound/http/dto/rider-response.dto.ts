import { Rider } from '../../../../domain/entities/rider.entity';

export interface RiderResponseDto {
  id: string;
  name: string;
  nationality?: string;
  imageUrl?: string;
  type?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

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
