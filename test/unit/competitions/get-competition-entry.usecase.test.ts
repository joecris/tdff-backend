import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCompetitionUseCase } from '@modules/competitions/application/use-cases/create-competition.usecase';
import { SubmitCompetitionEntryUseCase } from '@modules/competitions/application/use-cases/submit-competition-entry.usecase';
import { GetCompetitionEntryUseCase } from '@modules/competitions/application/use-cases/get-competition-entry.usecase';
import { Competition } from '@modules/competitions/domain/entities/competition.entity';
import {
  CompetitionEntryNotFoundError,
  CompetitionNotFoundError,
} from '@modules/competitions/domain/errors/competition.errors';
import { buildCompetitionsFixture, seedGrandTourAndLeague } from './fixtures';

describe('GetCompetitionEntryUseCase', () => {
  let fixture: ReturnType<typeof buildCompetitionsFixture>;
  let getEntryUseCase: GetCompetitionEntryUseCase;
  let competition: Competition;
  let userId: string;
  let grandTourRiderId: string;

  beforeEach(async () => {
    fixture = buildCompetitionsFixture();
    const { grandTour, league } = await seedGrandTourAndLeague(fixture);
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
    const user = await fixture.userService.createUser({ email: 'bob@example.com', name: 'Bob' });
    userId = user.id;

    getEntryUseCase = new GetCompetitionEntryUseCase(
      fixture.competitionEntryRepository,
      fixture.competitionRepository,
    );
  });

  it('returns the submitted entry', async () => {
    const submitUseCase = new SubmitCompetitionEntryUseCase(
      fixture.competitionEntryRepository,
      fixture.competitionRepository,
      fixture.userService,
      fixture.fantasyLeagueService,
      fixture.grandTourParticipationService,
    );
    await submitUseCase.execute({
      competitionId: competition.id,
      userId,
      selections: [{ slot: 'climber', grandTourRiderId }],
    });

    const entry = await getEntryUseCase.execute(competition.id, userId);
    expect(entry.userId).toBe(userId);
  });

  it('throws CompetitionEntryNotFoundError when the user has no entry', async () => {
    await expect(getEntryUseCase.execute(competition.id, userId)).rejects.toBeInstanceOf(
      CompetitionEntryNotFoundError,
    );
  });

  it('throws CompetitionNotFoundError for an unknown competition', async () => {
    await expect(
      getEntryUseCase.execute('00000000-0000-0000-0000-000000000000', userId),
    ).rejects.toBeInstanceOf(CompetitionNotFoundError);
  });
});
