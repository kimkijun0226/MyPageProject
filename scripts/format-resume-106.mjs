/**
 * 이력서 토픽(106) BlockNote 본문 — 내용은 유지하고 가독성만 개선
 * node scripts/format-resume-106.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";

const SECTION_H2 = new Set(["간단 자기소개", "기술스택", "경력(1년 11개월)", "학력"]);
const SECTION_H3 = new Set(["주요성과", "1. 대량 문자 발송 플랫폼 리뉴얼 및 고도화", "2. 스마트오더 · 키오스크 · POS 관리자 시스템"]);
const SECTION_H4 = new Set(["회사 간단 소개", "담당업무"]);
const BOLD_LABELS = new Set(["문제정의", "해결방안", "성과"]);

function newId() {
  return randomUUID();
}

function cloneBlock(block) {
  const next = {
    ...block,
    id: newId(),
    props: block.props ? { ...block.props } : {},
    content: block.content?.map((c) => ({ ...c, styles: c.styles ? { ...c.styles } : {} })) ?? [],
    children: block.children?.map(cloneBlock) ?? [],
  };

  if (next.type === "heading" && next.content?.[0]?.text) {
    const text = next.content[0].text;
    if (SECTION_H2.has(text)) next.props.level = 2;
    else if (SECTION_H3.has(text)) next.props.level = 3;
    else if (SECTION_H4.has(text)) next.props.level = 4;
    else if (next.props.level === 3 && /^\d\)/.test(text)) next.props.level = 4;
  }

  if (next.type === "bulletListItem" && next.content?.length === 1) {
    const text = next.content[0].text?.trim();
    if (BOLD_LABELS.has(text)) {
      next.content[0].styles = { bold: true };
    }
  }

  return next;
}

function emptyParagraph() {
  return {
    id: newId(),
    type: "paragraph",
    props: { backgroundColor: "default", textColor: "default", textAlignment: "left" },
    content: [],
    children: [],
  };
}

function divider() {
  return { id: newId(), type: "divider", props: {}, children: [] };
}

function headingText(block) {
  return block.type === "heading" ? block.content?.map((c) => c.text).join("") ?? "" : "";
}

function formatResume(blocks) {
  const out = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const title = headingText(block);

    if (title === "기술스택" || title === "경력(1년 11개월)" || title === "학력") {
      out.push(divider());
      out.push(emptyParagraph());
    }

    if (title === "주요성과") {
      out.push(emptyParagraph());
    }

    if (title === "2. 스마트오더 · 키오스크 · POS 관리자 시스템") {
      out.push(divider());
      out.push(emptyParagraph());
    }

    out.push(cloneBlock(block));
  }

  return out;
}

const inputPath = "scripts/.portfolio-seed/resume-106-blocks.json";
const blocks = JSON.parse(readFileSync(inputPath, "utf8"));
const formatted = formatResume(blocks);

writeFileSync("scripts/.portfolio-seed/resume-106-formatted.json", JSON.stringify(formatted, null, 2));

const content = JSON.stringify(formatted);
const sql = `UPDATE topic SET content = $resume106$${content}$resume106$ WHERE id = 106;`;
writeFileSync("scripts/.portfolio-seed/resume-106-update.sql", sql);
writeFileSync(
  "scripts/.portfolio-seed/.mcp-exec-resume-106.json",
  JSON.stringify({ project_id: "qdpekurmredvfdsaxkca", query: sql }),
);

console.log("blocks:", blocks.length, "->", formatted.length);
console.log("written scripts/.portfolio-seed/resume-106-formatted.json");
