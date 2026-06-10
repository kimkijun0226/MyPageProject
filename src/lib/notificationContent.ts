import type { Notification, NotificationType } from "@/api/notification";

export function truncateText(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function buildCommentNotificationContent(
  nickname: string,
  topicTitle: string | undefined,
  kind: "comment" | "reply",
) {
  const label = kind === "reply" ? "답글" : "댓글";
  const title = topicTitle ? truncateText(topicTitle, 40) : null;
  return title ? `${nickname}님이 ${title} 글에 ${label}을 남겼습니다.` : `${nickname}님이 글에 ${label}을 남겼습니다.`;
}

export function buildTopicLikeNotificationContent(nickname: string, topicTitle?: string) {
  const title = topicTitle ? truncateText(topicTitle, 40) : null;
  return title ? `${nickname}님이 ${title} 글에 좋아요를 눌렀습니다.` : `${nickname}님이 글에 좋아요를 눌렀습니다.`;
}

export function buildCommentLikeNotificationContent(nickname: string) {
  return `${nickname}님이 회원님의 댓글에 좋아요를 눌렀습니다.`;
}

function extractTopicTitleFromContent(content: string): string | null {
  const quoted = content.match(/"([^"]+)"\s*글에/);
  if (quoted?.[1]) return quoted[1];
  const titled = content.match(/제목:\s*(.+)$/m);
  if (titled?.[1]) return titled[1].trim();
  const unquoted = content.match(/님이\s+(.+?)\s+글에/);
  if (unquoted?.[1]) return unquoted[1].trim();
  return null;
}

export function getNotificationDisplayTitle(
  notification: Notification & { sender?: { nickname: string | null } | null },
): string {
  const nickname = notification.sender?.nickname?.trim() || "회원";
  const topicTitle = extractTopicTitleFromContent(notification.content);
  const firstLine = notification.content.split("\n").map((l) => l.trim()).find(Boolean) ?? "";

  switch (notification.type as NotificationType) {
    case "comment":
      return buildCommentNotificationContent(nickname, topicTitle ?? undefined, "comment");
    case "reply":
      return buildCommentNotificationContent(nickname, topicTitle ?? undefined, "reply");
    case "follow":
      return `${nickname}님이 팔로우 했습니다.`;
    case "new_post":
      if (firstLine.includes("님이")) return firstLine;
      return `${nickname}님이 새 글을 작성했습니다.`;
    case "topic_like":
      return buildTopicLikeNotificationContent(nickname, topicTitle ?? undefined);
    case "comment_like":
      return buildCommentLikeNotificationContent(nickname);
    default:
      return firstLine || notification.content;
  }
}

export function getNotificationDisplayPreview(content: string): string {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) return "";
  const preview = lines.slice(1).join(" ");
  return preview.startsWith('"') && preview.endsWith('"') ? preview.slice(1, -1) : preview;
}
