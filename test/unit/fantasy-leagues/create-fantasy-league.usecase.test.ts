import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { CreateFantasyLeagueUseCase } from '@modules/fantasy-leagues/application/use-cases/create-fantasy-league.usecase';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { GrandTourService } from '@modules/grand-tours/application/grand-tour.service';
import { GrandTourNotFoundError } from '@modules/grand-tours/domain/errors/grand-tour.errors';
import { FakeFantasyLeagueRepository } from './fake-fantasy-league.repository';
import { FakeGrandTourRepository } from '../grand-tours/fake-grand-tour.repository';

describe('CreateFantasyLeagueUseCase', () => {
  let fantasyLeagueRepository: FakeFantasyLeagueRepository;
  let grandTourRepository: FakeGrandTourRepository;
  let grandTourService: GrandTourService;
  let useCase: CreateFantasyLeagueUseCase;
  let grandTour: GrandTour;

  beforeEach(async () => {
    fantasyLeagueRepository = new FakeFantasyLeagueRepository();
    grandTourRepository = new FakeGrandTourRepository();
    grandTourService = new GrandTourService(grandTourRepository);
    useCase = new CreateFantasyLeagueUseCase(fantasyLeagueRepository, grandTourService);

    grandTour = GrandTour.create({ id: randomUUID(), name: 'Tour de France' });
    await grandTourRepository.save(grandTour);
  });

  it('creates a fantasy league for an existing grand tour', async () => {
    const league = await useCase.execute({
      name: '  Tour de France Fantasy  ',
      grandTourId: grandTour.id,
    });

    expect(league.name).toBe('Tour de France Fantasy');
    expect(league.grandTourId).toBe(grandTour.id);
  });

  it('throws GrandTourNotFoundError when grandTourId does not exist', async () => {
    await expect(
      useCase.execute({
        name: 'Orphan League',
        grandTourId: '00000000-0000-0000-0000-000000000000',
      }),
    ).rejects.toBeInstanceOf(GrandTourNotFoundError);
  });
});
