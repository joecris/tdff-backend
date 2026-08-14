// Vercel's serverless entry point — deliberately plain CommonJS JS, not
// TypeScript. `src/**` (with its `@modules/...`-style path aliases) is
// outside this file's concern entirely: it imports the already-COMPILED
// output of `npm run build` (tsc + tsc-alias, which fully resolves those
// aliases to plain relative requires), rather than asking Vercel's own
// bundler to understand our tsconfig `paths`. `vercel.json`'s
// `buildCommand` runs that build before this file is ever packaged, so
// `../dist/...` always exists by the time this executes. This also keeps
// the file out of `tsconfig.json`'s `include` glob entirely (it only
// covers `src/**`/`test/**`) — nothing to type-check against a `dist/`
// that doesn't exist locally until you actually build.
//
// `main.ts` (the traditional `app.listen()` entrypoint) is untouched and
// still used for local dev / any non-serverless hosting — this is a
// parallel, Vercel-specific entry point, not a replacement.
//
// `buildContainer()`/`createApp()` run once here, at module load — reused
// across warm invocations of the same function instance, same principle
// as `client.ts`'s singleton `pool`/`db`.
const { buildContainer } = require('../dist/infrastructure/config/di-container');
const { createApp } = require('../dist/infrastructure/http/app');

const container = buildContainer();
const app = createApp(container);

// An Express app is directly callable as `(req, res) => void`, which is
// exactly what Vercel's Node runtime expects from a handler — no
// `@vercel/node` wrapper or adapter package needed.
module.exports = app;
