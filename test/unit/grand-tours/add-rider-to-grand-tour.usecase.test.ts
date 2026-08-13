import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { AddRiderToGrandTourUseCase } from '@modules/grand-tours/application/use-cases/add-rider-to-grand-tour.usecase';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import {
  GrandTourNotFoundError,
  RiderAlreadyInGrandTourError,
} from '@modules/grand-tours/domain/errors/grand-tour.errors';
import { RiderService } from '@modules/riders/application/rider.service';
import { RiderNotFoundError } from '@modules/riders/domain/errors/rider.errors';
import { TeamService } from '@modules/teams/application/team.service';
import { FakeGrandTourRepository } from './fake-grand-tour.repository';
import { FakeGrandTourRiderRepository } from './fake-grand-tour-rider.repository';
import { FakeRiderRepository } from '../riders/fake-rider.repository';
import { FakeTeamRepository } from '../teams/fake-team.repository';

describe('AddRiderToGrandTourUseCase', () => {
  let grandTourRepository: FakeGrandTourRepository;
  let grandTourRiderRepository: FakeGrandTourRiderRepository;
  let riderService: RiderService;
  let useCase: AddRiderToGrandTourUseCase;
  let grandTour: GrandTour;

  beforeEach(async () => {
    grandTourRepository = new FakeGrandTourRepository();
    grandTourRiderRepository = new FakeGrandTourRiderRepository();
    const teamService = new TeamService(new FakeTeamRepository());
    riderService = new RiderService(new FakeRiderRepository(), teamService);
    useCase = new AddRiderToGrandTourUseCase(
      grandTourRiderRepository,
      grandTourRepository,
      riderService,
    );

    grandTour = GrandTour.create({ id: randomUUID(), name: 'Tour de France' });
    await grandTourRepository.save(grandTour);
  });

  it('adds a rider to the grand tour start list', async () => {
    const rider = await riderService.createRider({ name: 'Tadej Pogačar' });

    const grandTourRider = await useCase.execute({ grandTourId: grandTour.id, riderId: rider.id });

    expect(grandTourRider.grandTourId).toBe(grandTour.id);
    expect(grandTourRider.riderId).toBe(rider.id);
  });

  it('throws GrandTourNotFoundError for an unknown grand tour', async () => {
    const rider = await riderService.createRider({ name: 'Tadej Pogačar' });

    await expect(
      useCase.execute({ grandTourId: '00000000-0000-0000-0000-000000000000', riderId: rider.id }),
    ).rejects.toBeInstanceOf(GrandTourNotFoundError);
  });

  it('throws RiderNotFoundError for an unknown rider', async () => {
    await expect(
      useCase.execute({
        grandTourId: grandTour.id,
        riderId: '00000000-0000-0000-0000-000000000000',
      }),
    ).rejects.toBeInstanceOf(RiderNotFoundError);
  });

  it('throws RiderAlreadyInGrandTourError when the rider is already on the start list', async () => {
    const rider = await riderService.createRider({ name: 'Tadej Pogačar' });
    await useCase.execute({ grandTourId: grandTour.id, riderId: rider.id });

    await expect(
      useCase.execute({ grandTourId: grandTour.id, riderId: rider.id }),
    ).rejects.toBeInstanceOf(RiderAlreadyInGrandTourError);
  });
});
