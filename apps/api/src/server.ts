import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';
const server = app.listen(Number(process.env.PORT || 4000), () =>
  console.log('CareLedger API listening on port', process.env.PORT || 4000),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, async () => {
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  });
