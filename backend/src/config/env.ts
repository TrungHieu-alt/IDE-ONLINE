import 'dotenv/config';

const DEFAULT_PORT = 3000;
const DEFAULT_DB_SSL = false;

export type AppEnv = {
  port: number;
  databaseUrl: string;
  databaseSsl: boolean;
};

function readRequired(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readNumber(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsedValue;
}

function readBoolean(name: string, fallback: boolean): boolean {
  const rawValue = process.env[name]?.trim().toLowerCase();

  if (!rawValue) {
    return fallback;
  }

  if (rawValue === 'true') {
    return true;
  }

  if (rawValue === 'false') {
    return false;
  }

  throw new Error(`${name} must be either "true" or "false"`);
}

export function getEnv(): AppEnv {
  return {
    port: readNumber('PORT', DEFAULT_PORT),
    databaseUrl: readRequired('DATABASE_URL'),
    databaseSsl: readBoolean('DATABASE_SSL', DEFAULT_DB_SSL),
  };
}
