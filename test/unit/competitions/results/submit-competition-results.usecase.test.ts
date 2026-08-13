import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { SubmitCompetitionResultsUseCase } from '@modules/competitions/application/use-cases/submit-competition-results.usecase';
import { CreateCompetitionUseCase } from '@modules/competitions/application/use-cases/create-competition.usecase';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';
import { Competition } from '@modules/competitions/domain/entities/competition.entity';
import {
  CompetitionNotFoundError,
  DuplicateResultSlotError,
  RiderNotInGrandTourError,
} from '@modules/competitions/domain/errors/competition.errors';
import { UserNotFoundError } from '@modules/user/domain/errors/user.errors';
import { buildCompetitionsFixture, seedGrandTourAndLeague } from '../fixtures';
import { FakeCompetitionResultRepository } from './fake-competition-result.repository';
import { FakeScoringService } from './fake-scoring-service';

describe('SubmitCompetitionResultsUseCase', () => {
  let fixture: ReturnType<typeof buildCompetitionsFixture>;
  let resultRepository: FakeCompetitionResultRepository;
  let scoringService: FakeScoringService;
  let useCase: SubmitCompetitionResultsUseCase;
  let grandTour: GrandTour;
  let league: FantasyLeague;
  let competition: Competition;
  let adminId: string;
  let grandTourRiderId: string;

  beforeEach(async () => {
    fixture = buildCompetitionsFixture();
    resultRepository = new FakeCompetitionResultRepository();
    scoringService = new FakeScoringService();
    useCase = new SubmitCompetitionResultsUseCase(
      resultRepository,
      fixture.competitionRepository,
      fixture.userService,
      fixture.fantasyLeagueService,
      fixture.grandTourParticipationService,
      scoringService,
    );

    const seeded = await seedGrandTourAndLeague(fixture);
    grandTour = seeded.grandTour;
    league = seeded.league;

    competition = await new CreateCompetitionUseCase(
      fixture.competitionRepository,
      fixture.fantasyLeagueService,
    ).execute({
      name: 'King of the Mountain',
      type: 'mountains',
      fantasyLeagueId: league.id,
      slots: [{ slot: 'climber', points: 10 }],
    });

    const rider = await fixture.riderService.createRider({ name: 'Tadej Pogačar' });
    const grandTourRider = await fixture.grandTourParticipationService.addRider({
      grandTourId: grandTour.id,
      riderId: rider.id,
    });
    grandTourRiderId = grandTourRider.id;

    const admin = await fixture.userService.createUser({
      email: 'admin@example.com',
      name: 'Admin',
    });
    adminId = admin.id;
  });

  it('creates a result and triggers score recalculation for this competition', async () => {
    const result = await useCase.execute({
      competitionId: competition.id,
      submittedByUserId: adminId,
      selections: [{ slot: 'climber', grandTourRiderId }],
    });

    expect(result.competitionId).toBe(competition.id);
    expect(scoringService.recalculateCalls).toEqual([competition.id]);
  });

  it('resubmitting replaces the result and triggers recalculation again', async () => {
    await useCase.execute({
      competitionId: competition.id,
      submittedByUserId: adminId,
      selections: [{ slot: 'climber', grandTourRiderId }],
    });

    const otherRider = await fixture.riderService.createRider({ name: 'Second Rider' });
    const otherGrandTourRider = await fixture.grandTourParticipationService.addRider({
      grandTourId: grandTour.id,
      riderId: otherRider.id,
    });

    await useCase.execute({
      competitionId: competition.id,
      submittedByUserId: adminId,
      selections: [{ slot: 'climber', grandTourRiderId: otherGrandTourRider.id }],
    });

    const stored = await resultRepository.findByCompetition(competition.id);
    expect(stored?.selections).toHaveLength(1);
    expect(stored?.selections[0]?.grandTourRiderId).toBe(otherGrandTourRider.id);
    expect(scoringService.recalculateCalls).toEqual([competition.id, competition.id]);
  });

  it('throws CompetitionNotFoundError for an unknown competition', async () => {
    await expect(
      useCase.execute({
        competitionId: '00000000-0000-0000-0000-000000000000',
        selections: [{ slot: 'climber', grandTourRiderId }],
      }),
    ).rejects.toBeInstanceOf(CompetitionNotFoundError);
  });

  it('throws UserNotFoundError when submittedByUserId does not exist', async () => {
    await expect(
      useCase.execute({
        competitionId: competition.id,
        submittedByUserId: '00000000-0000-0000-0000-000000000000',
        selections: [{ slot: 'climber', grandTourRiderId }],
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('throws DuplicateResultSlotError when the same slot is submitted twice', async () => {
    await expect(
      useCase.execute({
        competitionId: competition.id,
        selections: [
          { slot: 'climber', grandTourRiderId },
          { slot: 'climber', grandTourRiderId },
        ],
      }),
    ).rejects.toBeInstanceOf(DuplicateResultSlotError);
  });

  it('throws RiderNotInGrandTourError when the rider belongs to a different grand tour', async () => {
    const otherGrandTour = GrandTour.create({ id: randomUUID(), name: "Giro d'Italia" });
    await fixture.grandTourRepository.save(otherGrandTour);
    const otherRider = await fixture.riderService.createRider({ name: 'Wrong Tour Rider' });
    const otherGrandTourRider = await fixture.grandTourParticipationService.addRider({
      grandTourId: otherGrandTour.id,
      riderId: otherRider.id,
    });

    await expect(
      useCase.execute({
        competitionId: competition.id,
        selections: [{ slot: 'climber', grandTourRiderId: otherGrandTourRider.id }],
      }),
    ).rejects.toBeInstanceOf(RiderNotInGrandTourError);
  });

  it('does not trigger recalculation when validation fails before persisting', async () => {
    await expect(
      useCase.execute({ competitionId: competition.id, selections: [] }),
    ).rejects.toThrow();
    expect(scoringService.recalculateCalls).toHaveLength(0);
  });
});
