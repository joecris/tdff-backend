import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateCompetitionDetailsUseCase } from '@modules/competitions/application/use-cases/update-competition-details.usecase';
import { CreateCompetitionUseCase } from '@modules/competitions/application/use-cases/create-competition.usecase';
import { Competition } from '@modules/competitions/domain/entities/competition.entity';
import { CompetitionNotFoundError } from '@modules/competitions/domain/errors/competition.errors';
import { CompetitionResult } from '@modules/competitions/domain/entities/competition-result.entity';
import { buildCompetitionsFixture, seedGrandTourAndLeague } from './fixtures';
import { FakeCompetitionResultRepository } from './results/fake-competition-result.repository';

describe('UpdateCompetitionDetailsUseCase', () => {
  let fixture: ReturnType<typeof buildCompetitionsFixture>;
  let useCase: UpdateCompetitionDetailsUseCase;
  let competition: Competition;

  beforeEach(async () => {
    fixture = buildCompetitionsFixture();
    useCase = new UpdateCompetitionDetailsUseCase(fixture.competitionRepository);

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

  it('sets imageUrl and persists it', async () => {
    const updated = await useCase.execute({
      competitionId: competition.id,
      imageUrl: 'https://example.com/kom.png',
    });

    expect(updated.imageUrl).toBe('https://example.com/kom.png');

    const persisted = await fixture.competitionRepository.findById(competition.id);
    expect(persisted?.imageUrl).toBe('https://example.com/kom.png');
  });

  it('leaves the slot config untouched', async () => {
    const updated = await useCase.execute({
      competitionId: competition.id,
      imageUrl: 'https://example.com/kom.png',
    });

    expect(updated.slots).toEqual([{ slot: 'climber', points: 10 }]);
  });

  it('throws CompetitionNotFoundError for an unknown competition', async () => {
    await expect(
      useCase.execute({
        competitionId: '00000000-0000-0000-0000-000000000000',
        imageUrl: 'https://example.com/kom.png',
      }),
    ).rejects.toBeInstanceOf(CompetitionNotFoundError);
  });

  it('is not blocked by an existing result, unlike updateCompetitionSlots', async () => {
    const resultRepository = new FakeCompetitionResultRepository();
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
        imageUrl: 'https://example.com/kom.png',
      }),
    ).resolves.toMatchObject({ imageUrl: 'https://example.com/kom.png' });
  });
});
