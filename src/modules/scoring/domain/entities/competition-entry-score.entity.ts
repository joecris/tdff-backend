import { BaseEntity } from '@shared/domain/base-entity';

export interface CompetitionEntryScoreProps {
  id: string;
  entryId: string;
  competitionId: string;
  userId: string;
  score: number;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * A computed value, not something a caller "creates" with business rules
 * to validate — no `create()` factory with invariants; `fromCalculation`
 * exists purely to bundle a freshly-computed score with its metadata
 * before persisting, `fromPersistence` to rehydrate an existing row.
 */
export class CompetitionEntryScore extends BaseEntity<string> {
  private constructor(private props: CompetitionEntryScoreProps) {
    super(props.id);
  }

  static fromCalculation(props: {
    id: string;
    entryId: string;
    competitionId: string;
    userId: string;
    score: number;
  }): CompetitionEntryScore {
    const now = new Date();
    return new CompetitionEntryScore({
      ...props,
      calculatedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: CompetitionEntryScoreProps): CompetitionEntryScore {
    return new CompetitionEntryScore(props);
  }

  get entryId(): string {
    return this.props.entryId;
  }

  get competitionId(): string {
    return this.props.competitionId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get score(): number {
    return this.props.score;
  }

  get calculatedAt(): Date {
    return this.props.calculatedAt;
  }

  toJSON(): CompetitionEntryScoreProps {
    return { ...this.props };
  }
}
