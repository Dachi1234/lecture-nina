import { spawnSync } from "node:child_process";

process.env.DATABASE_URL ??= "postgresql://build:build@127.0.0.1:5432/build";
process.env.DATABASE_URL_UNPOOLED ??= process.env.DATABASE_URL;

const result = spawnSync("prisma", ["generate"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
