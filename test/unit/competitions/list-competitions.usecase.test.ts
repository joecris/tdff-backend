import { describe, it, expect, beforeEach } from 'vitest';
import { ListCompetitionsUseCase } from '@modules/competitions/application/use-cases/list-competitions.usecase';
import { CreateCompetitionUseCase } from '@modules/competitions/application/use-cases/create-competition.usecase';
import { buildCompetitionsFixture, seedGrandTourAndLeague } from './fixtures';

describe('ListCompetitionsUseCase', () => {
  let fixture: ReturnType<typeof buildCompetitionsFixture>;
  let useCase: ListCompetitionsUseCase;

  beforeEach(async () => {
    fixture = buildCompetitionsFixture();
    useCase = new ListCompetitionsUseCase(fixture.competitionRepository);

    const { league } = await seedGrandTourAndLeague(fixture);
    const createUseCase = new CreateCompetitionUseCase(
      fixture.competitionRepository,
      fixture.fantasyLeagueService,
    );
    for (let i = 0; i < 3; i++) {
      await createUseCase.execute({
        name: `Competition ${i}`,
        type: 'mountains',
        fantasyLeagueId: league.id,
        slots: [{ slot: 'climber', points: 10 }],
      });
    }
  });

  it('returns a page of items with their slots intact', async () => {
    const result = await useCase.execute({ page: 1, limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
    for (const item of result.items) {
      expect(item.slots).toEqual([{ slot: 'climber', points: 10 }]);
    }
  });

  it('returns an empty page with totalPages 0 for an empty collection', async () => {
    const empty = buildCompetitionsFixture();
    const result = await new ListCompetitionsUseCase(empty.competitionRepository).execute({
      page: 1,
      limit: 50,
    });

    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(0);
  });
});
