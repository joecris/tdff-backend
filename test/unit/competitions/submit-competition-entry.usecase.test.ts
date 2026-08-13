import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { SubmitCompetitionEntryUseCase } from '@modules/competitions/application/use-cases/submit-competition-entry.usecase';
import { CreateCompetitionUseCase } from '@modules/competitions/application/use-cases/create-competition.usecase';
import { GrandTour } from '@modules/grand-tours/domain/entities/grand-tour.entity';
import { FantasyLeague } from '@modules/fantasy-leagues/domain/entities/fantasy-league.entity';
import { Competition } from '@modules/competitions/domain/entities/competition.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import {
  CompetitionNotFoundError,
  DuplicateEntrySlotError,
  InvalidEntrySelectionsError,
  RiderNotInGrandTourError,
  TeamNotInGrandTourError,
} from '@modules/competitions/domain/errors/competition.errors';
import { UserNotFoundError } from '@modules/user/domain/errors/user.errors';
import {
  GrandTourRiderNotFoundError,
  GrandTourTeamNotFoundError,
} from '@modules/grand-tours/domain/errors/grand-tour.errors';
import { buildCompetitionsFixture, seedGrandTourAndLeague } from './fixtures';

describe('SubmitCompetitionEntryUseCase', () => {
  let fixture: ReturnType<typeof buildCompetitionsFixture>;
  let useCase: SubmitCompetitionEntryUseCase;
  let grandTour: GrandTour;
  let league: FantasyLeague;
  let mountainsCompetition: Competition;
  let generalClassificationCompetition: Competition;
  let user: User;
  let grandTourRiderId: string;
  let grandTourTeamId: string;

  beforeEach(async () => {
    fixture = buildCompetitionsFixture();
    useCase = new SubmitCompetitionEntryUseCase(
      fixture.competitionEntryRepository,
      fixture.competitionRepository,
      fixture.userService,
      fixture.fantasyLeagueService,
      fixture.grandTourParticipationService,
    );

    const seeded = await seedGrandTourAndLeague(fixture);
    grandTour = seeded.grandTour;
    league = seeded.league;

    const createCompetition = new CreateCompetitionUseCase(
      fixture.competitionRepository,
      fixture.fantasyLeagueService,
    );
    mountainsCompetition = await createCompetition.execute({
      name: 'King of the Mountain',
      type: 'mountains',
      fantasyLeagueId: league.id,
      slots: [{ slot: 'climber', points: 10 }],
    });
    generalClassificationCompetition = await createCompetition.execute({
      name: 'Overall Podium',
      type: 'general_classification',
      fantasyLeagueId: league.id,
      slots: [
        { slot: 'overall_team', points: 5 },
        { slot: 'top_1', points: 10 },
        { slot: 'top_2', points: 7 },
        { slot: 'top_3', points: 5 },
      ],
    });

    const team = await fixture.teamService.createTeam({ name: 'UAE Team Emirates' });
    const rider = await fixture.riderService.createRider({
      name: 'Tadej Pogačar',
      teamId: team.id,
    });
    const grandTourTeam = await fixture.grandTourParticipationService.addTeam({
      grandTourId: grandTour.id,
      teamId: team.id,
    });
    const grandTourRider = await fixture.grandTourParticipationService.addRider({
      grandTourId: grandTour.id,
      riderId: rider.id,
    });
    grandTourRiderId = grandTourRider.id;
    grandTourTeamId = grandTourTeam.id;

    user = await fixture.userService.createUser({ email: 'bob@example.com', name: 'Bob' });
  });

  it('creates a new entry with a valid rider pick', async () => {
    const entry = await useCase.execute({
      competitionId: mountainsCompetition.id,
      userId: user.id,
      selections: [{ slot: 'climber', grandTourRiderId }],
    });

    expect(entry.userId).toBe(user.id);
    expect(entry.selections).toHaveLength(1);
    expect(entry.selections[0]?.grandTourRiderId).toBe(grandTourRiderId);
  });

  it('resubmitting replaces the existing entry rather than creating a second one', async () => {
    const first = await useCase.execute({
      competitionId: mountainsCompetition.id,
      userId: user.id,
      selections: [{ slot: 'climber', grandTourRiderId }],
    });

    const otherRider = await fixture.riderService.createRider({ name: 'Second Rider' });
    const otherGrandTourRider = await fixture.grandTourParticipationService.addRider({
      grandTourId: grandTour.id,
      riderId: otherRider.id,
    });

    const second = await useCase.execute({
      competitionId: mountainsCompetition.id,
      userId: user.id,
      selections: [{ slot: 'climber', grandTourRiderId: otherGrandTourRider.id }],
    });

    expect(second.id).toBe(first.id);
    expect(second.selections[0]?.grandTourRiderId).toBe(otherGrandTourRider.id);

    const all = await fixture.competitionEntryRepository.listByCompetition(mountainsCompetition.id);
    expect(all).toHaveLength(1);
  });

  it('accepts a team pick for a slot that requires one', async () => {
    const entry = await useCase.execute({
      competitionId: generalClassificationCompetition.id,
      userId: user.id,
      selections: [
        { slot: 'overall_team', grandTourTeamId },
        { slot: 'top_1', grandTourRiderId },
        { slot: 'top_2', grandTourRiderId },
        { slot: 'top_3', grandTourRiderId },
      ],
    });

    expect(entry.selections.find((s) => s.slot === 'overall_team')?.grandTourTeamId).toBe(
      grandTourTeamId,
    );
  });

  it('throws CompetitionNotFoundError for an unknown competition', async () => {
    await expect(
      useCase.execute({
        competitionId: '00000000-0000-0000-0000-000000000000',
        userId: user.id,
        selections: [{ slot: 'climber', grandTourRiderId }],
      }),
    ).rejects.toBeInstanceOf(CompetitionNotFoundError);
  });

  it('throws UserNotFoundError for an unknown user', async () => {
    await expect(
      useCase.execute({
        competitionId: mountainsCompetition.id,
        userId: '00000000-0000-0000-0000-000000000000',
        selections: [{ slot: 'climber', grandTourRiderId }],
      }),
    ).rejects.toBeInstanceOf(UserNotFoundError);
  });

  it('throws InvalidEntrySelectionsError when a required slot is missing', async () => {
    await expect(
      useCase.execute({ competitionId: mountainsCompetition.id, userId: user.id, selections: [] }),
    ).rejects.toBeInstanceOf(InvalidEntrySelectionsError);
  });

  it('throws DuplicateEntrySlotError when the same slot is submitted twice', async () => {
    await expect(
      useCase.execute({
        competitionId: mountainsCompetition.id,
        userId: user.id,
        selections: [
          { slot: 'climber', grandTourRiderId },
          { slot: 'climber', grandTourRiderId },
        ],
      }),
    ).rejects.toBeInstanceOf(DuplicateEntrySlotError);
  });

  it('throws GrandTourRiderNotFoundError when grandTourRiderId does not exist at all', async () => {
    await expect(
      useCase.execute({
        competitionId: mountainsCompetition.id,
        userId: user.id,
        selections: [{ slot: 'climber', grandTourRiderId: '00000000-0000-0000-0000-000000000000' }],
      }),
    ).rejects.toBeInstanceOf(GrandTourRiderNotFoundError);
  });

  it('throws GrandTourTeamNotFoundError when grandTourTeamId does not exist at all', async () => {
    await expect(
      useCase.execute({
        competitionId: generalClassificationCompetition.id,
        userId: user.id,
        selections: [
          { slot: 'overall_team', grandTourTeamId: '00000000-0000-0000-0000-000000000000' },
          { slot: 'top_1', grandTourRiderId },
          { slot: 'top_2', grandTourRiderId },
          { slot: 'top_3', grandTourRiderId },
        ],
      }),
    ).rejects.toBeInstanceOf(GrandTourTeamNotFoundError);
  });

  it('throws RiderNotInGrandTourError when the rider is on the start list of a DIFFERENT grand tour', async () => {
    const otherGrandTour = GrandTour.create({ id: randomUUID(), name: "Giro d'Italia" });
    await fixture.grandTourRepository.save(otherGrandTour);
    const otherRider = await fixture.riderService.createRider({ name: 'Wrong Tour Rider' });
    const otherGrandTourRider = await fixture.grandTourParticipationService.addRider({
      grandTourId: otherGrandTour.id,
      riderId: otherRider.id,
    });

    await expect(
      useCase.execute({
        competitionId: mountainsCompetition.id,
        userId: user.id,
        selections: [{ slot: 'climber', grandTourRiderId: otherGrandTourRider.id }],
      }),
    ).rejects.toBeInstanceOf(RiderNotInGrandTourError);
  });

  it('throws TeamNotInGrandTourError when the team is on the start list of a DIFFERENT grand tour', async () => {
    const otherGrandTour = GrandTour.create({ id: randomUUID(), name: 'Vuelta a España' });
    await fixture.grandTourRepository.save(otherGrandTour);
    const otherTeam = await fixture.teamService.createTeam({ name: 'Wrong Tour Team' });
    const otherGrandTourTeam = await fixture.grandTourParticipationService.addTeam({
      grandTourId: otherGrandTour.id,
      teamId: otherTeam.id,
    });

    await expect(
      useCase.execute({
        competitionId: generalClassificationCompetition.id,
        userId: user.id,
        selections: [
          { slot: 'overall_team', grandTourTeamId: otherGrandTourTeam.id },
          { slot: 'top_1', grandTourRiderId },
          { slot: 'top_2', grandTourRiderId },
          { slot: 'top_3', grandTourRiderId },
        ],
      }),
    ).rejects.toBeInstanceOf(TeamNotInGrandTourError);
  });
});
