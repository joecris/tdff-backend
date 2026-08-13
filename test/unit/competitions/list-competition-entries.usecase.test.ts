import { describe, it, expect, beforeEach } from 'vitest';
import { CreateCompetitionUseCase } from '@modules/competitions/application/use-cases/create-competition.usecase';
import { SubmitCompetitionEntryUseCase } from '@modules/competitions/application/use-cases/submit-competition-entry.usecase';
import { ListCompetitionEntriesUseCase } from '@modules/competitions/application/use-cases/list-competition-entries.usecase';
import { CompetitionNotFoundError } from '@modules/competitions/domain/errors/competition.errors';
import { buildCompetitionsFixture, seedGrandTourAndLeague } from './fixtures';

describe('ListCompetitionEntriesUseCase', () => {
  let fixture: ReturnType<typeof buildCompetitionsFixture>;
  let listUseCase: ListCompetitionEntriesUseCase;
  let competitionId: string;

  beforeEach(async () => {
    fixture = buildCompetitionsFixture();
    const { grandTour, league } = await seedGrandTourAndLeague(fixture);
    const competition = await new CreateCompetitionUseCase(
      fixture.competitionRepository,
      fixture.fantasyLeagueService,
    ).execute({
      name: 'King of the Mountain',
      type: 'mountains',
      fantasyLeagueId: league.id,
      slots: [{ slot: 'climber', points: 10 }],
    });
    competitionId = competition.id;

    const rider = await fixture.riderService.createRider({ name: 'Tadej Pogačar' });
    const grandTourRider = await fixture.grandTourParticipationService.addRider({
      grandTourId: grandTour.id,
      riderId: rider.id,
    });

    const submitUseCase = new SubmitCompetitionEntryUseCase(
      fixture.competitionEntryRepository,
      fixture.competitionRepository,
      fixture.userService,
      fixture.fantasyLeagueService,
      fixture.grandTourParticipationService,
    );
    for (const email of ['bob@example.com', 'carol@example.com']) {
      const user = await fixture.userService.createUser({ email, name: email });
      await submitUseCase.execute({
        competitionId,
        userId: user.id,
        selections: [{ slot: 'climber', grandTourRiderId: grandTourRider.id }],
      });
    }

    listUseCase = new ListCompetitionEntriesUseCase(
      fixture.competitionEntryRepository,
      fixture.competitionRepository,
    );
  });

  it('lists every entry for the competition', async () => {
    const entries = await listUseCase.execute(competitionId);
    expect(entries).toHaveLength(2);
  });

  it('throws CompetitionNotFoundError for an unknown competition', async () => {
    await expect(
      listUseCase.execute('00000000-0000-0000-0000-000000000000'),
    ).rejects.toBeInstanceOf(CompetitionNotFoundError);
  });
});
