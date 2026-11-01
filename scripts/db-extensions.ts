import "dotenv/config";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  for (const ext of ["vector", "pg_trgm", "unaccent"]) {
    await client.query(`CREATE EXTENSION IF NOT EXISTS ${ext}`);
  }
  console.log("[db] extensions ready: vector, pg_trgm, unaccent");
}

main()
  .catch((error) => {
    console.error("[db] failed to create extensions. Use the pgvector/pgvector image from docker-compose.yml.", error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
