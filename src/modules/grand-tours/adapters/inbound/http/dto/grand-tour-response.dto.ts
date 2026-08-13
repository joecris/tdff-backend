import { GrandTour } from '../../../../domain/entities/grand-tour.entity';
import { formatDdMmYyyy } from '@shared/utils/date-format';

export interface GrandTourResponseDto {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

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
