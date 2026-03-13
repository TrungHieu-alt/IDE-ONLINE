import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const timestampConfig = {
  mode: 'date' as const,
  withTimezone: true,
};

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'USER']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    displayName: varchar('display_name', { length: 50 }),
    role: userRoleEnum('role').default('USER').notNull(),
    isVerified: boolean('is_verified').default(false).notNull(),
    verificationToken: varchar('verification_token', { length: 255 }),
    verificationExpiresAt: timestamp(
      'verification_expires_at',
      timestampConfig,
    ),
    isActive: boolean('is_active').default(true).notNull(),
    authVersion: integer('auth_version').default(0).notNull(),
    deletedAt: timestamp('deleted_at', timestampConfig),
    createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', timestampConfig).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_users_email').on(table.email),
    index('idx_users_role').on(table.role),
    index('idx_users_verification_token').on(table.verificationToken),
    index('idx_users_deleted_at').on(table.deletedAt),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at', timestampConfig).notNull(),
    revokedAt: timestamp('revoked_at', timestampConfig),
    replacedByTokenId: uuid('replaced_by_token_id').references(
      (): AnyPgColumn => refreshTokens.id,
    ),
    createdIp: varchar('created_ip', { length: 64 }),
    userAgent: text('user_agent'),
    lastUsedAt: timestamp('last_used_at', timestampConfig),
    createdAt: timestamp('created_at', timestampConfig).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_refresh_tokens_hash').on(table.tokenHash),
    index('idx_refresh_tokens_user').on(table.userId),
    index('idx_refresh_tokens_expiry').on(table.expiresAt),
  ],
);

export const schema = {
  refreshTokens,
  users,
};

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
