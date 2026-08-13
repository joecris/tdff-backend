import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCompetitionUseCase } from '@modules/competitions/application/use-cases/create-competition.usecase';
import { FantasyLeagueNotFoundError } from '@modules/fantasy-leagues/domain/errors/fantasy-league.errors';
import { buildCompetitionsFixture, seedGrandTourAndLeague } from './fixtures';

describe('CreateCompetitionUseCase', () => {
  let fixture: ReturnType<typeof buildCompetitionsFixture>;
  let useCase: CreateCompetitionUseCase;

  beforeEach(() => {
    fixture = buildCompetitionsFixture();
    useCase = new CreateCompetitionUseCase(
      fixture.competitionRepository,
      fixture.fantasyLeagueService,
    );
  });

  it('creates a competition for an existing fantasy league', async () => {
    const { league } = await seedGrandTourAndLeague(fixture);

    const competition = await useCase.execute({
      name: 'King of the Mountain',
      type: 'mountains',
      fantasyLeagueId: league.id,
      slots: [{ slot: 'climber', points: 10 }],
    });

    expect(competition.name).toBe('King of the Mountain');
    expect(competition.type).toBe('mountains');
    expect(competition.fantasyLeagueId).toBe(league.id);
  });

  it('throws FantasyLeagueNotFoundError for an unknown fantasyLeagueId', async () => {
    await expect(
      useCase.execute({
        name: 'Orphan Competition',
        type: 'mountains',
        fantasyLeagueId: '00000000-0000-0000-0000-000000000000',
        slots: [{ slot: 'climber', points: 10 }],
      }),
    ).rejects.toBeInstanceOf(FantasyLeagueNotFoundError);
  });
});
