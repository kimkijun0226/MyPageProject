/**
 * 개발(engineering) 카테고리 토픽 시드·업데이트
 *
 * node --env-file=.env scripts/seed-engineering-topics.mjs
 * node --env-file=.env scripts/seed-engineering-topics.mjs --update
 */
import { createClient } from "@supabase/supabase-js";
import { buildContent } from "./lib/blocknote-helpers.mjs";
import { TOPICS } from "./engineering-topics-data.mjs";

const AUTHOR_ID = "ef4a9d07-9073-4607-964b-21c4cc385090";
const IS_UPDATE = process.argv.includes("--update");

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!url || !key) {
  console.error("VITE_SUPABASE_URL 및 SUPABASE_SECRET_KEY(.env)가 필요합니다.");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  for (const topic of TOPICS) {
    const content = buildContent(topic);

    const { data: existing } = await supabase
      .from("topic")
      .select("id, title")
      .eq("category", "engineering")
      .or(`title.eq.${topic.title},title.eq.Portfolio — 스크롤 애니메이션 성능 개선`)
      .maybeSingle();

    if (existing) {
      if (IS_UPDATE) {
        const { error } = await supabase
          .from("topic")
          .update({ title: topic.title, content, thumbnail: topic.thumbnail })
          .eq("id", existing.id);
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

    const { data, error } = await supabase
      .from("topic")
      .insert({
        author: AUTHOR_ID,
        title: topic.title,
        content,
        category: "engineering",
        thumbnail: topic.thumbnail,
        status: "publish",
        visibility: "PUBLIC",
      })
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
