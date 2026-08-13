import { Competition } from '../../../../domain/entities/competition.entity';

export interface CompetitionSlotConfigResponseDto {
  slot: string;
  points: number;
}

export interface CompetitionResponseDto {
  id: string;
  name: string;
  description?: string;
  type: string;
  fantasyLeagueId: string;
  entryLockAt?: string;
  slots: CompetitionSlotConfigResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export function toCompetitionResponseDto(competition: Competition): CompetitionResponseDto {
  return {
    id: competition.id,
    name: competition.name,
    type: competition.type,
    fantasyLeagueId: competition.fantasyLeagueId,
    slots: competition.slots,
    ...(competition.description !== undefined ? { description: competition.description } : {}),
    ...(competition.entryLockAt !== undefined
      ? { entryLockAt: competition.entryLockAt.toISOString() }
      : {}),
    createdAt: competition.createdAt.toISOString(),
    updatedAt: competition.updatedAt.toISOString(),
  };
}
