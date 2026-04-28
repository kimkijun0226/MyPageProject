import {
  BriefcaseBusiness,
  CalendarCheck,
  CodeXml,
  DraftingCompass,
  List,
  Footprints,
} from "lucide-react";

export const CLASS_CATEGORY = [
  { id: 1, label: "전체", category: "", icon: <List /> },
  { id: 2, label: "포트폴리오", category: "portfolio", icon: <BriefcaseBusiness /> },
  { id: 3, label: "디자인", category: "design", icon: <DraftingCompass /> },
  { id: 4, label: "IT·프로그래밍", category: "programming", icon: <CodeXml /> },
  { id: 5, label: "자기계발", category: "self-development", icon: <Footprints /> },
  { id: 6, label: "계획", category: "plan", icon: <CalendarCheck /> },
];

export const TOPIC_CATEGORY = [
  { id: 1, label: "포트폴리오", category: "portfolio" },
  { id: 2, label: "디자인", category: "design" },
  { id: 3, label: "IT·프로그래밍", category: "programming" },
  { id: 4, label: "자기계발", category: "self-development" },
  { id: 5, label: "계획", category: "plan" },
];
