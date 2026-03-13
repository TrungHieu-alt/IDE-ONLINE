import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getEnv } from '../config/env';
import { DATABASE_CLIENT, DATABASE_POOL } from './database.constants';
import { DatabaseLifecycle } from './database.lifecycle';
import { schema } from './schema';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: () => {
        const env = getEnv();

        return new Pool({
          connectionString: env.databaseUrl,
          ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
        });
      },
    },
    {
      provide: DATABASE_CLIENT,
      inject: [DATABASE_POOL],
      useFactory: (pool: Pool) => drizzle(pool, { schema }),
    },
    DatabaseLifecycle,
  ],
  exports: [DATABASE_CLIENT, DATABASE_POOL],
})
export class DatabaseModule {}
