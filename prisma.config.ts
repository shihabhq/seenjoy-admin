import "dotenv/config";
import { defineConfig } from "prisma/config";

// Switch pooler port from 6543 (transaction) to 5432 (session) for Prisma CLI.
// Session mode supports prepared statements and schema migrations.
function getMigrateUrl() {
  const url = process.env["DATABASE_URL"] ?? "";
  return url.replace(":6543/", ":5432/");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getMigrateUrl(),
  },
});
