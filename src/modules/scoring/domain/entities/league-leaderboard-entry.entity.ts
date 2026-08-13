import { BaseEntity } from '@shared/domain/base-entity';

export interface LeagueLeaderboardEntryProps {
  id: string;
  fantasyLeagueId: string;
  userId: string;
  totalScore: number;
  rank: number;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Same "computed value, not user-created" shape as CompetitionEntryScore. */
export class LeagueLeaderboardEntry extends BaseEntity<string> {
  private constructor(private props: LeagueLeaderboardEntryProps) {
    super(props.id);
  }

  static fromCalculation(props: {
    id: string;
    fantasyLeagueId: string;
    userId: string;
    totalScore: number;
    rank: number;
  }): LeagueLeaderboardEntry {
    const now = new Date();
    return new LeagueLeaderboardEntry({
      ...props,
      calculatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: LeagueLeaderboardEntryProps): LeagueLeaderboardEntry {
    return new LeagueLeaderboardEntry(props);
  }

  get fantasyLeagueId(): string {
    return this.props.fantasyLeagueId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get totalScore(): number {
    return this.props.totalScore;
  }

  get rank(): number {
    return this.props.rank;
  }

  get calculatedAt(): Date {
    return this.props.calculatedAt;
  }

  toJSON(): LeagueLeaderboardEntryProps {
    return { ...this.props };
  }
}
