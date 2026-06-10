import { useCreateBlockNote } from "@blocknote/react";
// Or, you can use ariakit, shadcn, etc.
import { BlockNoteView } from "@blocknote/mantine";
import { ko } from "@blocknote/core/locales";
// Default styles for the mantine editor
import "@blocknote/mantine/style.css";
// Include the included Inter font
import "@blocknote/core/fonts/inter.css";
import type { Block } from "@blocknote/core";
import { useEffect } from "react";
import { useTheme } from "@/components/theme-context";
import { cn } from "@/lib/utils";

interface AppEditorProps {
  content?: Block[];
  setContent?: (content: Block[]) => void;
  readonly?: boolean;
  className?: string;
}

export function AppEditor({ content, setContent, readonly, className }: AppEditorProps) {
  const locale = ko;
  const { theme } = useTheme();
  const resolvedTheme =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
  // Create a new editor instance
  const editor = useCreateBlockNote({
    dictionary: {
      ...locale,
      placeholders: {
        ...locale.placeholders,
        emptyDocument: "텍스트를 입력하거나 '/'를 눌러 명령어를 실행하세요.",
      },
    },
  });

  useEffect(() => {
    if (content && content.length > 0) {
      const current = JSON.stringify(editor.document);
      const next = JSON.stringify(content);

      // 두 개의 배열이 다르면 업데이트
      if (current !== next) {
        editor.replaceBlocks(editor.document, content);
      }
    }
  }, [content, editor]);
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        !readonly && "[&_.bn-editor]:min-h-full [&_.bn-container]:min-h-full",
        className,
      )}
    >
      <BlockNoteView
        editor={editor}
        editable={!readonly}
        lang="ko"
        theme={resolvedTheme}
        className={cn(!readonly && "min-h-full flex-1")}
        onChange={() => {
          if (!readonly) {
            setContent?.(editor.document);
          }
        }}
      />
    </div>
  );
}
