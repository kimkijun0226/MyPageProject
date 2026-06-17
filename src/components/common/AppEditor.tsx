import { BlockNoteSchema, createCodeBlockSpec, type Block } from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { ko } from "@blocknote/core/locales";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { topicApi } from "@/api";
import { useTheme } from "@/components/theme-context";
import { cn } from "@/lib/utils";

const blockNoteSchema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: createCodeBlockSpec({
      ...codeBlockOptions,
      defaultLanguage: "typescript",
    }),
  },
});

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

  const uploadFile = useCallback(async (file: File) => {
    try {
      return await topicApi.uploadContentImage(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.";
      toast.error(message);
      throw error;
    }
  }, []);

  const editor = useCreateBlockNote(
    {
      schema: blockNoteSchema,
      dictionary: {
        ...locale,
        placeholders: {
          ...locale.placeholders,
          emptyDocument: "텍스트를 입력하거나 '/'를 눌러 명령어를 실행하세요.",
        },
      },
      uploadFile: readonly ? undefined : uploadFile,
    },
    [readonly, uploadFile],
  );

  useEffect(() => {
    if (content && content.length > 0) {
      const current = JSON.stringify(editor.document);
      const next = JSON.stringify(content);

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
