import { app } from './app';
import { closeDatabase, connectDatabase } from './config/database';
import { env } from './config/env';

let server: ReturnType<typeof app.listen>;
async function start() {
  await connectDatabase();
  server = app.listen(env.PORT, () => console.log(`Visitor Management API listening on port ${env.PORT}`));
}
async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
  await closeDatabase();
  process.exit(0);
}
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
start().catch((error) => { console.error('Unable to start server', error); process.exit(1); });
