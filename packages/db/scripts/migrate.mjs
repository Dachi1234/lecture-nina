import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

process.env.DATABASE_URL_UNPOOLED ||= process.env.DATABASE_URL;

const result = spawnSync("pnpm", ["--filter", "@nina/db", "exec", "prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
