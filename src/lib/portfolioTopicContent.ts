import type { Block } from "@blocknote/core";
import { nanoid } from "nanoid";

export const PORTFOLIO_LINK_SECTION_TITLE = "링크";

const TEMPLATE_SUBTITLE_HEADING = "소제목을 입력해 주세요. (ex: MyPage — 개인 블로그·커뮤니티)";
const TEMPLATE_DESCRIPTION = "프로젝트에 대한 설명글을 써주세요.";
const TEMPLATE_LINK_PLACEHOLDER = "관련 링크를 기입해주세요";

type InlinePart = { type: "text"; text: string; styles: { bold?: boolean } };

function inlineText(text: string, bold = false): InlinePart {
  return { type: "text", text, styles: bold ? { bold: true } : {} };
}

function getBlockPlainText(block: Block): string {
  if (!block.content || !Array.isArray(block.content)) return "";
  return block.content
    .map((item) => (typeof item === "object" && item !== null && "text" in item ? String(item.text) : ""))
    .join("");
}

function parseUrlFromLabelLine(text: string): string {
  const dash = text.split("—");
  let value = dash.length > 1 ? dash.slice(1).join("—").trim() : "";
  if (!value) {
    const colon = text.split(":");
    if (colon.length > 1) value = colon.slice(1).join(":").trim();
  }
  return value.replace(/^ex\)\s*/i, "").trim();
}

function headingBlock(text: string): Block {
  return {
    id: nanoid(),
    type: "heading",
    props: {
      backgroundColor: "default",
      textColor: "default",
      textAlignment: "left",
      level: 3,
      isToggleable: false,
    },
    content: [inlineText(text)],
    children: [],
  } as Block;
}

function dividerBlock(): Block {
  return { id: nanoid(), type: "divider", props: {}, children: [] } as Block;
}

function emptyParagraphBlock(): Block {
  return {
    id: nanoid(),
    type: "paragraph",
    props: { backgroundColor: "default", textColor: "default", textAlignment: "left" },
    content: [],
    children: [],
  } as Block;
}

function paragraphBlock(parts: { text: string; bold?: boolean }[]): Block[] {
  return [
    {
      id: nanoid(),
      type: "paragraph",
      props: { backgroundColor: "default", textColor: "default", textAlignment: "left" },
      content: parts.map((p) => inlineText(p.text, p.bold)),
      children: [],
    } as Block,
  ];
}

function linkSectionBlocks(): Block[] {
  return [
    headingBlock(PORTFOLIO_LINK_SECTION_TITLE),
    dividerBlock(),
    ...paragraphBlock([
      { text: "Link", bold: true },
      { text: ` — ${TEMPLATE_LINK_PLACEHOLDER}` },
    ]),
    ...paragraphBlock([
      { text: "GitHub", bold: true },
      { text: ` — ${TEMPLATE_LINK_PLACEHOLDER}` },
    ]),
  ];
}

/**
 * 신규 프로젝트 글 작성 시 BlockNote에 자동 삽입되는 본문 템플릿.
 *
 * ### 소제목을 입력해 주세요. (ex: MyPage — 개인 블로그·커뮤니티)
 * ***
 * 프로젝트에 대한 설명글을 써주세요.
 *
 * ### 링크
 * ***
 * **Link** — 관련 링크를 기입해주세요
 * **GitHub** — 관련 링크를 기입해주세요
 */
export function createPortfolioBodyTemplate(): Block[] {
  return [
    headingBlock(TEMPLATE_SUBTITLE_HEADING),
    dividerBlock(),
    ...paragraphBlock([{ text: TEMPLATE_DESCRIPTION }]),
    emptyParagraphBlock(),
    ...linkSectionBlocks(),
  ];
}

export function isPortfolioContentEmpty(content: string | null | undefined): boolean {
  if (!content) return true;
  try {
    const blocks = JSON.parse(content) as Block[];
    return !Array.isArray(blocks) || blocks.length === 0;
  } catch {
    return true;
  }
}

export function parsePortfolioLinks(blocks: Block[]): { liveUrl: string; githubUrl: string } {
  let liveUrl = "";
  let githubUrl = "";

  for (const block of blocks) {
    if (block.type !== "paragraph") continue;
    const text = getBlockPlainText(block);
    if (/^(Link|Live)\b/i.test(text)) liveUrl = parseUrlFromLabelLine(text);
    if (/GitHub/i.test(text)) githubUrl = parseUrlFromLabelLine(text);
  }

  return { liveUrl, githubUrl };
}

function isPlaceholderLinkValue(value: string) {
  const trimmed = value.trim();
  return (
    !trimmed ||
    trimmed === TEMPLATE_LINK_PLACEHOLDER ||
    trimmed === "관련 깃허브를 기입해주세요" ||
    /^ex\)/i.test(trimmed)
  );
}

function isFilledUrl(url: string) {
  if (isPlaceholderLinkValue(url)) return false;
  if (url.trim() === "https://") return false;
  if (url.trim() === "https://github.com/") return false;
  return true;
}

export function isPortfolioTemplatePlaceholder(blocks: Block[]) {
  for (const block of blocks) {
    const text = getBlockPlainText(block).trim();
    if (
      block.type === "heading" &&
      (text === TEMPLATE_SUBTITLE_HEADING || text === "소제목: (ex: MyPage — 개인 블로그·커뮤니티)")
    ) {
      return true;
    }
    if (block.type === "paragraph" && text === TEMPLATE_DESCRIPTION) return true;
    if (block.type === "paragraph" && /^Link\b/i.test(text)) {
      const value = parseUrlFromLabelLine(getBlockPlainText(block));
      if (value === TEMPLATE_LINK_PLACEHOLDER) return true;
    }
    if (block.type === "paragraph" && /GitHub/i.test(text)) {
      const value = parseUrlFromLabelLine(getBlockPlainText(block));
      if (value === TEMPLATE_LINK_PLACEHOLDER || value === "관련 깃허브를 기입해주세요") return true;
    }
  }
  return false;
}

export function arePortfolioLinksFilled(blocks: Block[]) {
  const { liveUrl, githubUrl } = parsePortfolioLinks(blocks);
  return isFilledUrl(liveUrl) && isFilledUrl(githubUrl);
}

export function arePortfolioLinksValid(blocks: Block[]) {
  if (isPortfolioTemplatePlaceholder(blocks)) return false;
  return arePortfolioLinksFilled(blocks);
}
