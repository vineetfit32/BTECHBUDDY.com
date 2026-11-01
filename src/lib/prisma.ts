import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createClient() {
  const fromEnv = Boolean(process.env.DATABASE_URL);
  const connectionString = process.env.DATABASE_URL ?? "postgresql://btechbuddy:btechbuddy@localhost:5432/btechbuddy";
  let host = "unparsed";
  try {
    host = new URL(connectionString.replace(/^postgresql:/, "http:")).hostname;
  } catch {
    host = "invalid";
  }
  // #region agent log
  fetch("http://127.0.0.1:7863/ingest/69005fa4-f6cf-43e1-ac04-a58eb906e019", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fe4cd9" }, body: JSON.stringify({ sessionId: "fe4cd9", runId: "pre-fix", hypothesisId: "C", location: "src/lib/prisma.ts:createClient", message: "prisma client created", data: { fromEnv, host, nodeEnv: process.env.NODE_ENV ?? "unset", phase: process.env.NEXT_PHASE ?? "unset" }, timestamp: Date.now() }) }).catch(() => {});
  // #endregion
  const adapter = new PrismaPg({
    connectionString,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = global.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
