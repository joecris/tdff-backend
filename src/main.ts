import { env } from '@infrastructure/config/env';
import { buildContainer } from '@infrastructure/config/di-container';
import { createApp } from '@infrastructure/http/app';
import { closeDb } from '@infrastructure/db/client';

const container = buildContainer();
const app = createApp(container);

const server = app.listen(env.PORT, () => {
  console.warn(`tdff-backend listening on port ${env.PORT} [${env.NODE_ENV}]`);
});

async function shutdown(signal: string): Promise<void> {
  console.warn(`Received ${signal}, shutting down gracefully...`);
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
