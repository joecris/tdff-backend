import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Express } from 'express';
import { buildContainer } from '@infrastructure/config/di-container';
import { createApp } from '@infrastructure/http/app';
import { closeDb } from '@infrastructure/db/client';
import { clearDb } from '@infrastructure/db/seed/clear-db';

/**
 * The only test in the whole suite that exercises `buildContainer()` +
 * `createApp()` together — real DI wiring, real routes, real middleware
 * chain, real Postgres. Everything else (unit tests) verifies application
 * logic in isolation over fakes; this is what proves those pieces are
 * actually wired together correctly end-to-end.
 */
describe('API smoke test — full stack (integration)', () => {
  let app: Express;
  let adminId: string;

  beforeAll(async () => {
    await clearDb();
    const container = buildContainer();
    app = createApp(container);

    // The public POST /users endpoint deliberately doesn't accept `role`
    // (self-elevation to admin would be a real hole once Auth0 enforcement
    // lands) — this is the one place this test reaches past the HTTP
    // layer, purely to bootstrap a privileged principal for the
    // admin-gated steps below. Everything else goes through real HTTP.
    const admin = await container.user.userService.createUser({
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
    });
    adminId = admin.id;
  });

  afterAll(async () => {
    await closeDb();
  });

  it('create league -> create competition -> submit entry -> submit results -> leaderboard reflects the score', async () => {
    const grandTourRes = await request(app)
      .post('/api/grand-tours')
      .set('x-user-id', adminId)
      .send({ name: 'Smoke Test Grand Tour' })
      .expect(201);
    const grandTourId: string = grandTourRes.body.id;

    const riderRes = await request(app)
      .post('/api/riders')
      .set('x-user-id', adminId)
      .send({ name: 'Smoke Test Rider' })
      .expect(201);
    const riderId: string = riderRes.body.id;

    const grandTourRiderRes = await request(app)
      .post(`/api/grand-tours/${grandTourId}/riders`)
      .set('x-user-id', adminId)
      .send({ riderId })
      .expect(201);
    const grandTourRiderId: string = grandTourRiderRes.body.id;

    const leagueRes = await request(app)
      .post('/api/fantasy-leagues')
      .set('x-user-id', adminId)
      .send({ name: 'Smoke Test League', grandTourId })
      .expect(201);
    const leagueId: string = leagueRes.body.id;

    // Phase 4.5 shape — required slots + points are set per competition
    // instance, not derived from `type`.
    const competitionRes = await request(app)
      .post('/api/competitions')
      .set('x-user-id', adminId)
      .send({
        name: 'Smoke Test Stage Winner',
        type: 'stage_winner',
        fantasyLeagueId: leagueId,
        slots: [{ slot: 'top_1', points: 10 }],
      })
      .expect(201);
    const competitionId: string = competitionRes.body.id;

    const userRes = await request(app)
      .post('/api/users')
      .send({ email: 'player@example.com', name: 'Player One' })
      .expect(201);
    const userId: string = userRes.body.id;

    // Must join the league to appear on its leaderboard at all — a scored
    // entry alone isn't enough (see RecalculateLeagueLeaderboardUseCase).
    await request(app)
      .post(`/api/fantasy-leagues/${leagueId}/join`)
      .set('x-user-id', userId)
      .expect(201);

    await request(app)
      .post(`/api/competitions/${competitionId}/entries`)
      .set('x-user-id', userId)
      .send({ selections: [{ slot: 'top_1', grandTourRiderId }] })
      .expect(200);

    // Admin declares the same rider the winner — the entry should score
    // full points, and that recalculation should cascade into the league
    // leaderboard automatically (SubmitCompetitionResultsUseCase's whole
    // reason for existing).
    await request(app)
      .post(`/api/competitions/${competitionId}/results`)
      .set('x-user-id', adminId)
      .send({ selections: [{ slot: 'top_1', grandTourRiderId }] })
      .expect(200);

    const leaderboardRes = await request(app)
      .get(`/api/fantasy-leagues/${leagueId}/leaderboard`)
      .expect(200);

    expect(leaderboardRes.body).toEqual([
      expect.objectContaining({ userId, totalScore: 10, rank: 1 }),
    ]);
  });
});
