import { FantasyLeagueMember } from '../../../../domain/entities/fantasy-league-member.entity';
import {
  FantasyLeagueMemberRow,
  NewFantasyLeagueMemberRow,
} from '@infrastructure/db/schema/fantasy-league-member.schema';

export class FantasyLeagueMemberMapper {
  static toDomain(row: FantasyLeagueMemberRow): FantasyLeagueMember {
    return FantasyLeagueMember.fromPersistence({
      id: row.id,
      fantasyLeagueId: row.fantasyLeagueId,
      userId: row.userId,
      role: row.role,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(member: FantasyLeagueMember): NewFantasyLeagueMemberRow {
    const props = member.toJSON();
    return {
      id: props.id,
      fantasyLeagueId: props.fantasyLeagueId,
      userId: props.userId,
      role: props.role,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
