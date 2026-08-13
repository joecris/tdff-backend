import { describe, it, expect, beforeEach } from 'vitest';
import { BulkImportTeamsUseCase } from '@modules/teams/application/use-cases/bulk-import-teams.usecase';
import { Team } from '@modules/teams/domain/entities/team.entity';
import { FakeTeamRepository } from './fake-team.repository';
import { buildWorkbookBuffer } from '../shared/build-workbook';
import { randomUUID } from 'node:crypto';

describe('BulkImportTeamsUseCase', () => {
  let repository: FakeTeamRepository;
  let useCase: BulkImportTeamsUseCase;

  beforeEach(() => {
    repository = new FakeTeamRepository();
    useCase = new BulkImportTeamsUseCase(repository);
  });

  it('creates new teams from valid rows', async () => {
    const buffer = await buildWorkbookBuffer(
      ['Name', 'Logo URL'],
      [
        ['UAE Team Emirates', 'https://example.com/uae.png'],
        ['Ineos Grenadiers', undefined],
      ],
    );

    const result = await useCase.execute(buffer);

    expect(result).toEqual({ created: 2, updated: 0, errors: [] });
    expect(await repository.findByName('UAE Team Emirates')).not.toBeNull();
    expect(await repository.findByName('Ineos Grenadiers')).not.toBeNull();
  });

  it('reconciles an existing team by exact name match instead of duplicating it', async () => {
    const existing = Team.create({ id: randomUUID(), name: 'UAE Team Emirates' });
    await repository.save(existing);

    const buffer = await buildWorkbookBuffer(
      ['Name', 'Logo URL'],
      [['UAE Team Emirates', 'https://example.com/new-logo.png']],
    );

    const result = await useCase.execute(buffer);

    expect(result).toEqual({ created: 0, updated: 1, errors: [] });
    const updated = await repository.findByName('UAE Team Emirates');
    expect(updated?.id).toBe(existing.id); // same row, not a new one
    expect(updated?.logoUrl).toBe('https://example.com/new-logo.png');
  });

  it('carries parse-time errors straight through without touching the repository', async () => {
    const buffer = await buildWorkbookBuffer(['Logo URL'], [['https://example.com/x.png']]);

    const result = await useCase.execute(buffer);

    expect(result.created).toBe(0);
    expect(result.updated).toBe(0);
    expect(result.errors).toEqual([{ row: 1, message: 'Missing required column "Name"' }]);
  });
});
