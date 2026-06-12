import {
  BriefcaseBusiness,
  CalendarCheck,
  CodeXml,
  DraftingCompass,
  IdCard,
  Sparkles,
} from "lucide-react";

export const DEFAULT_CATEGORY = "resume";

/** 이력서 카테고리 제목 (고정) */
export const RESUME_TITLE = "김기준 이력서";

/** 이력서 토픽 ID (고정) */
export const RESUME_TOPIC_ID = 106;

export function isResumeCategory(category: string) {
  return category === "resume";
}

export function isPortfolioCategory(category: string) {
  return category === "portfolio";
}

export const CLASS_CATEGORY = [
  { id: 1, label: "이력서", category: "resume", icon: <IdCard /> },
  { id: 2, label: "프로젝트", category: "portfolio", icon: <BriefcaseBusiness /> },
  { id: 3, label: "개발", category: "engineering", icon: <CodeXml /> },
  { id: 4, label: "디자인", category: "design", icon: <DraftingCompass /> },
  { id: 5, label: "취미", category: "lifestyle", icon: <Sparkles /> },
  { id: 6, label: "계획", category: "roadmap", icon: <CalendarCheck /> },
];

export function getCategoryAddLabel(category: string) {
  const label = CLASS_CATEGORY.find((c) => c.category === category)?.label ?? "글";
  return `${label} 글 추가`;
}

export const TOPIC_CATEGORY = [
  { id: 1, label: "이력서", category: "resume" },
  { id: 2, label: "프로젝트", category: "portfolio" },
  { id: 3, label: "개발", category: "engineering" },
  { id: 4, label: "디자인", category: "design" },
  { id: 5, label: "취미", category: "lifestyle" },
  { id: 6, label: "계획", category: "roadmap" },
];
