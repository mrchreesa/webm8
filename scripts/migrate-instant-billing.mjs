import { readFile, readdir } from "node:fs/promises";
import { Client } from "pg";

// Supply an owner/migration connection through INSTANT_DATABASE_URL.
// The restricted runtime login intentionally cannot change the schema.
// Never print connection strings or keys.
if (!process.env.INSTANT_DATABASE_URL) {
  console.error("INSTANT_DATABASE_URL is required."); process.exit(1);
}
const client = new Client({ connectionString: process.env.INSTANT_DATABASE_URL, connectionTimeoutMillis: 5000 });
try {
  await client.connect();
  const directory = new URL("../migrations/", import.meta.url);
  for (const file of (await readdir(directory)).filter(name => /^\d+_[a-z_]+\.sql$/.test(name)).sort()) {
    await client.query(await readFile(new URL(file, directory), "utf8"));
  }
  console.log("Instant Websites billing schema is ready.");
} catch (error) { console.error("Billing migration failed:", error.code || error.name); process.exitCode = 1; }
finally { await client.end(); }
