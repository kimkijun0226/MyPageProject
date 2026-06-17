import { writeFileSync, mkdirSync } from "fs";
import { buildContent } from "./lib/blocknote-helpers.mjs";
import { TOPICS } from "./engineering-topics-data.mjs";

const topic = TOPICS[0];
const content = buildContent(topic);
const titleEsc = topic.title.replace(/'/g, "''");
const tag = "eng_scroll_perf";

mkdirSync("scripts/.portfolio-seed", { recursive: true });

const sql = `INSERT INTO topic (author, title, content, category, thumbnail, status, visibility)
SELECT 'ef4a9d07-9073-4607-964b-21c4cc385090', '${titleEsc}', $${tag}$${content}$${tag}$, 'engineering', '${topic.thumbnail}', 'publish', 'PUBLIC'
WHERE NOT EXISTS (
  SELECT 1 FROM topic WHERE category = 'engineering' AND title = '${titleEsc}'
);`;

writeFileSync("scripts/.portfolio-seed/engineering-insert.sql", sql);
console.log("exported scripts/.portfolio-seed/engineering-insert.sql");
