import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTeamUseCase } from '@modules/teams/application/use-cases/create-team.usecase';
import { FakeTeamRepository } from './fake-team.repository';

describe('CreateTeamUseCase', () => {
  let repository: FakeTeamRepository;
  let useCase: CreateTeamUseCase;

  beforeEach(() => {
    repository = new FakeTeamRepository();
    useCase = new CreateTeamUseCase(repository);
  });

  it('creates a team with a trimmed name', async () => {
    const team = await useCase.execute({ name: '  UAE Team Emirates  ' });

    expect(team.name).toBe('UAE Team Emirates');
    expect(team.logoUrl).toBeUndefined();
    expect(await repository.findById(team.id)).not.toBeNull();
  });

  it('allows duplicate names — no uniqueness invariant on team name', async () => {
    const first = await useCase.execute({ name: 'Ineos Grenadiers' });
    const second = await useCase.execute({ name: 'Ineos Grenadiers' });

    expect(first.id).not.toBe(second.id);
    expect(await repository.findByName('Ineos Grenadiers')).not.toBeNull();
  });
});
