/**
 * 프로젝트 카테고리(portfolio) 토픽 시드·업데이트 스크립트
 *
 * node scripts/seed-portfolio-topics.mjs              — 신규 insert (없을 때만)
 * node scripts/seed-portfolio-topics.mjs --update     — 기존 토픽 content·thumbnail 갱신
 * node scripts/seed-portfolio-topics.mjs --export     — scripts/.portfolio-seed/topics.json
 * node scripts/seed-portfolio-topics.mjs --export-sql   — scripts/.portfolio-seed/update.sql
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";
import { buildContent } from "./lib/blocknote-helpers.mjs";
import { TOPICS } from "./portfolio-topics-data.mjs";

const AUTHOR_ID = "ef4a9d07-9073-4607-964b-21c4cc385090";
const IS_EXPORT = process.argv.includes("--export");
const IS_EXPORT_SQL = process.argv.includes("--export-sql");
const IS_UPDATE = process.argv.includes("--update");

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!IS_EXPORT && !IS_EXPORT_SQL && (!url || !key)) {
  console.error("VITE_SUPABASE_URL 및 SUPABASE_SECRET_KEY(.env)가 필요합니다.");
  process.exit(1);
}

const supabase = IS_EXPORT || IS_EXPORT_SQL ? null : createClient(url, key);

function exportJson() {
  mkdirSync("scripts/.portfolio-seed", { recursive: true });
  const payload = TOPICS.map((t) => ({
    topicId: t.topicId,
    title: t.title,
    thumbnail: t.thumbnail,
    content: buildContent(t),
  }));
  writeFileSync("scripts/.portfolio-seed/topics.json", JSON.stringify(payload, null, 2));
  console.log("exported scripts/.portfolio-seed/topics.json");
}

function exportSql() {
  mkdirSync("scripts/.portfolio-seed", { recursive: true });
  const lines = [
    "-- portfolio 토픽 본문·썸네일 업데이트 (BlockNote JSON + picsum 임시 이미지)",
    "-- 생성: node scripts/seed-portfolio-topics.mjs --export-sql",
    "",
  ];
  for (const topic of TOPICS) {
    const content = buildContent(topic);
    const titleEsc = topic.title.replace(/'/g, "''");

    const tag = `topic${topic.topicId}`;
    lines.push(
      `UPDATE topic SET`,
      `  title = '${titleEsc}',`,
      `  content = $${tag}$${content}$${tag}$,`,
      `  thumbnail = '${topic.thumbnail}'`,
      `WHERE id = ${topic.topicId};`,
      "",
    );
  }
  writeFileSync("scripts/.portfolio-seed/update.sql", lines.join("\n"));
  console.log("exported scripts/.portfolio-seed/update.sql");
}

async function main() {
  if (IS_EXPORT) {
    exportJson();
    return;
  }
  if (IS_EXPORT_SQL) {
    exportSql();
    return;
  }

  for (const topic of TOPICS) {
    const content = buildContent(topic);
    const { data: existing } = await supabase
      .from("topic")
      .select("id")
      .eq("id", topic.topicId)
      .maybeSingle();

    if (existing) {
      if (IS_UPDATE) {
        const { error } = await supabase
          .from("topic")
          .update({ title: topic.title, content, thumbnail: topic.thumbnail })
          .eq("id", topic.topicId);
        if (error) {
          console.error(`UPDATE FAIL: ${topic.title}`, error.message);
          process.exitCode = 1;
        } else {
          console.log(`UPDATED: ${topic.title} (#${existing.id})`);
        }
      } else {
        console.log(`SKIP (이미 존재, --update 로 갱신): ${topic.title} (#${existing.id})`);
      }
      continue;
    }

    const insertRow = {
      author: AUTHOR_ID,
      title: topic.title,
      content,
      category: "portfolio",
      thumbnail: topic.thumbnail,
      status: "publish",
      visibility: "PUBLIC",
    };
    if (topic.topicId) insertRow.id = topic.topicId;

    const { data, error } = await supabase
      .from("topic")
      .insert(insertRow)
      .select("id, title")
      .single();

    if (error) {
      console.error(`FAIL: ${topic.title}`, error.message);
      process.exitCode = 1;
      continue;
    }

    console.log(`OK: ${data.title} (#${data.id})`);
  }
}

main();
