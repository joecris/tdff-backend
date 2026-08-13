import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateCompetitionSlotsUseCase } from '@modules/competitions/application/use-cases/update-competition-slots.usecase';
import { CreateCompetitionUseCase } from '@modules/competitions/application/use-cases/create-competition.usecase';
import { Competition } from '@modules/competitions/domain/entities/competition.entity';
import {
  CompetitionNotFoundError,
  CompetitionResultsAlreadySubmittedError,
} from '@modules/competitions/domain/errors/competition.errors';
import { CompetitionResult } from '@modules/competitions/domain/entities/competition-result.entity';
import { buildCompetitionsFixture, seedGrandTourAndLeague } from './fixtures';
import { FakeCompetitionResultRepository } from './results/fake-competition-result.repository';

describe('UpdateCompetitionSlotsUseCase', () => {
  let fixture: ReturnType<typeof buildCompetitionsFixture>;
  let resultRepository: FakeCompetitionResultRepository;
  let useCase: UpdateCompetitionSlotsUseCase;
  let competition: Competition;

  beforeEach(async () => {
    fixture = buildCompetitionsFixture();
    resultRepository = new FakeCompetitionResultRepository();
    useCase = new UpdateCompetitionSlotsUseCase(fixture.competitionRepository, resultRepository);

    const { league } = await seedGrandTourAndLeague(fixture);
    competition = await new CreateCompetitionUseCase(
      fixture.competitionRepository,
      fixture.fantasyLeagueService,
    ).execute({
      name: 'King of the Mountain',
      type: 'mountains',
      fantasyLeagueId: league.id,
      slots: [{ slot: 'climber', points: 10 }],
    });
  });

  it('replaces the slot config when no result exists yet', async () => {
    const updated = await useCase.execute({
      competitionId: competition.id,
      slots: [{ slot: 'climber', points: 25 }],
    });

    expect(updated.slots).toEqual([{ slot: 'climber', points: 25 }]);

    const persisted = await fixture.competitionRepository.findById(competition.id);
    expect(persisted?.slots).toEqual([{ slot: 'climber', points: 25 }]);
  });

  it('throws CompetitionNotFoundError for an unknown competition', async () => {
    await expect(
      useCase.execute({
        competitionId: '00000000-0000-0000-0000-000000000000',
        slots: [{ slot: 'climber', points: 10 }],
      }),
    ).rejects.toBeInstanceOf(CompetitionNotFoundError);
  });

  it('throws CompetitionResultsAlreadySubmittedError once a result has been submitted', async () => {
    const result = CompetitionResult.create({
      id: '11111111-1111-1111-1111-111111111111',
      competitionId: competition.id,
      selections: [],
      requiredSlots: [],
    });
    await resultRepository.save(result);

    await expect(
      useCase.execute({
        competitionId: competition.id,
        slots: [{ slot: 'climber', points: 25 }],
      }),
    ).rejects.toBeInstanceOf(CompetitionResultsAlreadySubmittedError);
  });
});
