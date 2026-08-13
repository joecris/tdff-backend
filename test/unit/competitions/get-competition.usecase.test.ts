import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCompetitionUseCase } from '@modules/competitions/application/use-cases/create-competition.usecase';
import { GetCompetitionUseCase } from '@modules/competitions/application/use-cases/get-competition.usecase';
import { CompetitionNotFoundError } from '@modules/competitions/domain/errors/competition.errors';
import { buildCompetitionsFixture, seedGrandTourAndLeague } from './fixtures';

describe('GetCompetitionUseCase', () => {
  let fixture: ReturnType<typeof buildCompetitionsFixture>;
  let createUseCase: CreateCompetitionUseCase;
  let getUseCase: GetCompetitionUseCase;

  beforeEach(() => {
    fixture = buildCompetitionsFixture();
    createUseCase = new CreateCompetitionUseCase(
      fixture.competitionRepository,
      fixture.fantasyLeagueService,
    );
    getUseCase = new GetCompetitionUseCase(fixture.competitionRepository);
  });

  it('returns an existing competition by id', async () => {
    const { league } = await seedGrandTourAndLeague(fixture);
    const created = await createUseCase.execute({
      name: 'Points',
      type: 'points',
      fantasyLeagueId: league.id,
      slots: [{ slot: 'sprinter', points: 10 }],
    });

    const found = await getUseCase.execute(created.id);

    expect(found.id).toBe(created.id);
  });

  it('throws CompetitionNotFoundError for an unknown id', async () => {
    await expect(getUseCase.execute('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
      CompetitionNotFoundError,
    );
  });
});
