import "dotenv/config";
import pg from "pg";
import { SEARCH_INDEX_SQL } from "../src/lib/search/sql";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  for (const statement of SEARCH_INDEX_SQL) {
    await client.query(statement);
  }
  console.log(`[db] ${SEARCH_INDEX_SQL.length} search/vector index statements applied`);
}

main()
  .catch((error) => {
    console.error("[db] failed to apply indexes", error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
