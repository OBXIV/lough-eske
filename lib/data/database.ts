import "server-only";

import postgres from "postgres";

import type { UserSession } from "@/types/domain";

type SqlClient = ReturnType<typeof postgres>;
type TenantSql = postgres.TransactionSql;

declare global {
  // Reuse the client during local development hot reloads.
  var loughEskeSqlClient: SqlClient | undefined;
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL;
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}

export function areTenantWritesEnabled(session: UserSession) {
  return isDatabaseConfigured() && session.tenant.status === "active";
}

function createDatabaseClient() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error("Missing database connection string.");
  }

  return postgres(databaseUrl, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 3,
    prepare: false,
    ssl: databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1") ? false : "require",
  });
}

export function getDatabaseClient() {
  if (!globalThis.loughEskeSqlClient) {
    globalThis.loughEskeSqlClient = createDatabaseClient();
  }

  return globalThis.loughEskeSqlClient;
}

export async function withAuthenticatedRls<T>(authUserId: string, query: (sql: TenantSql) => Promise<T>) {
  const client = getDatabaseClient();

  return client.begin(async (sql) => {
    await sql.unsafe("set local role authenticated");
    await sql`select set_config('request.jwt.claim.sub', ${authUserId}, true)`;
    await sql`select set_config('request.jwt.claim.role', 'authenticated', true)`;

    return query(sql);
  });
}

export async function withTenantRls<T>(session: UserSession, query: (sql: TenantSql) => Promise<T>) {
  return withAuthenticatedRls(session.user.id, query);
}
