import { randomUUID } from "crypto";

export function bid() {
  return randomUUID();
}

export function heading(text, level = 3) {
  return {
    id: bid(),
    type: "heading",
    props: {
      backgroundColor: "default",
      textColor: "default",
      textAlignment: "left",
      level,
      isToggleable: false,
    },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  };
}

export function divider() {
  return { id: bid(), type: "divider", props: {}, children: [] };
}

export function paragraph(parts) {
  return {
    id: bid(),
    type: "paragraph",
    props: { backgroundColor: "default", textColor: "default", textAlignment: "left" },
    content: parts.map((p) => ({
      type: "text",
      text: p.text,
      styles: p.bold ? { bold: true } : {},
    })),
    children: [],
  };
}

export function plainParagraph(text) {
  return paragraph([{ text }]);
}

export function bullet(text) {
  return {
    id: bid(),
    type: "bulletListItem",
    props: { backgroundColor: "default", textColor: "default", textAlignment: "left" },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  };
}

export function emptyParagraph() {
  return {
    id: bid(),
    type: "paragraph",
    props: { backgroundColor: "default", textColor: "default", textAlignment: "left" },
    content: [],
    children: [],
  };
}

export function image(url, caption = "") {
  return {
    id: bid(),
    type: "image",
    props: {
      backgroundColor: "default",
      textAlignment: "left",
      name: "",
      url,
      caption,
      showPreview: true,
      previewWidth: 720,
    },
    children: [],
  };
}

export function picsum(seed, w = 1200, h = 675) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export function codeBlock(text, language = "typescript") {
  return {
    id: bid(),
    type: "codeBlock",
    props: { language },
    content: [{ type: "text", text, styles: {} }],
    children: [],
  };
}

function pushLine(blocks, line) {
  if (line.type === "p") blocks.push(paragraph(line.parts));
  if (line.type === "bullet") blocks.push(bullet(line.text));
  if (line.type === "image") blocks.push(image(line.url, line.caption ?? ""));
  if (line.type === "code") blocks.push(codeBlock(line.text, line.language ?? "typescript"));
}

export function buildContent(topic) {
  const blocks = [];

  for (const section of topic.sections) {
    blocks.push(heading(section.title));
    blocks.push(divider());
    for (const line of section.lines) pushLine(blocks, line);
    blocks.push(emptyParagraph());
  }

  return JSON.stringify(blocks);
}
