import { Competition } from '../domain/entities/competition.entity';
import { CompetitionEntry } from '../domain/entities/competition-entry.entity';
import { CompetitionResult } from '../domain/entities/competition-result.entity';
import { CompetitionRepositoryPort } from '../domain/ports/competition-repository.port';
import { CompetitionEntryRepositoryPort } from '../domain/ports/competition-entry-repository.port';
import { CompetitionResultRepositoryPort } from '../domain/ports/competition-result-repository.port';
import {
  CompetitionServicePort,
  CreateCompetitionInput,
  SubmitCompetitionEntryInput,
  SubmitCompetitionResultsInput,
  UpdateCompetitionSlotsInput,
} from '../domain/ports/competition-service.port';
import { FantasyLeagueServicePort } from '@modules/fantasy-leagues/domain/ports/fantasy-league-service.port';
import { UserServicePort } from '@modules/user/domain/ports/user-service.port';
import { GrandTourParticipationServicePort } from '@modules/grand-tours/domain/ports/grand-tour-participation-service.port';
import { ScoringServicePort } from '@modules/scoring/domain/ports/scoring-service.port';
import { CreateCompetitionUseCase } from './use-cases/create-competition.usecase';
import { GetCompetitionUseCase } from './use-cases/get-competition.usecase';
import { UpdateCompetitionSlotsUseCase } from './use-cases/update-competition-slots.usecase';
import { SubmitCompetitionEntryUseCase } from './use-cases/submit-competition-entry.usecase';
import { GetCompetitionEntryUseCase } from './use-cases/get-competition-entry.usecase';
import { ListCompetitionEntriesUseCase } from './use-cases/list-competition-entries.usecase';
import { SubmitCompetitionResultsUseCase } from './use-cases/submit-competition-results.usecase';

export class CompetitionService implements CompetitionServicePort {
  private readonly createCompetitionUseCase: CreateCompetitionUseCase;
  private readonly getCompetitionUseCase: GetCompetitionUseCase;
  private readonly updateCompetitionSlotsUseCase: UpdateCompetitionSlotsUseCase;
  private readonly submitEntryUseCase: SubmitCompetitionEntryUseCase;
  private readonly getEntryUseCase: GetCompetitionEntryUseCase;
  private readonly listEntriesUseCase: ListCompetitionEntriesUseCase;
  private readonly submitResultsUseCase: SubmitCompetitionResultsUseCase;

  constructor(
    competitionRepository: CompetitionRepositoryPort,
    entryRepository: CompetitionEntryRepositoryPort,
    resultRepository: CompetitionResultRepositoryPort,
    fantasyLeagueService: FantasyLeagueServicePort,
    userService: UserServicePort,
    grandTourParticipationService: GrandTourParticipationServicePort,
    scoringService: ScoringServicePort,
  ) {
    this.createCompetitionUseCase = new CreateCompetitionUseCase(
      competitionRepository,
      fantasyLeagueService,
    );
    this.getCompetitionUseCase = new GetCompetitionUseCase(competitionRepository);
    this.updateCompetitionSlotsUseCase = new UpdateCompetitionSlotsUseCase(
      competitionRepository,
      resultRepository,
    );
    this.submitEntryUseCase = new SubmitCompetitionEntryUseCase(
      entryRepository,
      competitionRepository,
      userService,
      fantasyLeagueService,
      grandTourParticipationService,
    );
    this.getEntryUseCase = new GetCompetitionEntryUseCase(entryRepository, competitionRepository);
    this.listEntriesUseCase = new ListCompetitionEntriesUseCase(
      entryRepository,
      competitionRepository,
    );
    this.submitResultsUseCase = new SubmitCompetitionResultsUseCase(
      resultRepository,
      competitionRepository,
      userService,
      fantasyLeagueService,
      grandTourParticipationService,
      scoringService,
    );
  }

  createCompetition(input: CreateCompetitionInput): Promise<Competition> {
    return this.createCompetitionUseCase.execute(input);
  }

  getCompetitionById(id: string): Promise<Competition> {
    return this.getCompetitionUseCase.execute(id);
  }

  updateCompetitionSlots(input: UpdateCompetitionSlotsInput): Promise<Competition> {
    return this.updateCompetitionSlotsUseCase.execute(input);
  }

  submitEntry(input: SubmitCompetitionEntryInput): Promise<CompetitionEntry> {
    return this.submitEntryUseCase.execute(input);
  }

  getMyEntry(competitionId: string, userId: string): Promise<CompetitionEntry> {
    return this.getEntryUseCase.execute(competitionId, userId);
  }

  listEntries(competitionId: string): Promise<CompetitionEntry[]> {
    return this.listEntriesUseCase.execute(competitionId);
  }

  submitResults(input: SubmitCompetitionResultsInput): Promise<CompetitionResult> {
    return this.submitResultsUseCase.execute(input);
  }
}
