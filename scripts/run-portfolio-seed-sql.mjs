import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = join(dirname(fileURLToPath(import.meta.url)), ".portfolio-seed");
const files = readdirSync(dir).filter((f) => f.startsWith("insert-") && f.endsWith(".sql"));

for (const file of files) {
  const sql = readFileSync(join(dir, file), "utf8");
  console.log(`\n---FILE:${file}---`);
  console.log(sql);
}
