import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

const dbPath = "file:" + path.join(import.meta.dirname!, "prisma", "dev.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbPath,
  },
});
