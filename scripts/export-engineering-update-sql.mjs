import { writeFileSync, mkdirSync } from "fs";
import { buildContent } from "./lib/blocknote-helpers.mjs";
import { TOPICS } from "./engineering-topics-data.mjs";

const topic = TOPICS[0];
const content = buildContent(topic);
const titleEsc = topic.title.replace(/'/g, "''");
const tag = "eng_scroll_perf";

mkdirSync("scripts/.portfolio-seed", { recursive: true });

const sql = `UPDATE topic SET
  title = '${titleEsc}',
  content = $${tag}$${content}$${tag}$,
  thumbnail = '${topic.thumbnail}'
WHERE category = 'engineering' AND (title = '${titleEsc}' OR title = 'Portfolio — 스크롤 애니메이션 성능 개선');`;

writeFileSync("scripts/.portfolio-seed/engineering-update.sql", sql);
console.log("exported scripts/.portfolio-seed/engineering-update.sql");
