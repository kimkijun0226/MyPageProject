import { useRef } from "react";
import { Input } from "../ui";
import { Asterisk, ImageIcon, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

const COVER_PLACEHOLDER_BG = "/assets/images/cover-placeholder.svg";

interface AppFileUploadProps {
  file: File | string | null;
  setFile: (file: File | string | null) => void;
  fill?: boolean;
  variant?: "default" | "cover";
  required?: boolean;
}

export function AppFileUpload({ file, setFile, fill, variant = "default", required }: AppFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
    e.target.value = "";
  };

  const openPicker = () => fileInputRef.current?.click();

  const imageSrc =
    typeof file === "string" ? file : file instanceof File ? URL.createObjectURL(file) : null;

  const coverHeightClass = "h-[clamp(220px,36vh,420px)]";

  if (variant === "cover") {
    if (!imageSrc) {
      return (
        <div className="w-full">
          <button
            type="button"
            onClick={openPicker}
            className={cn(
              "group relative flex w-full items-center justify-center overflow-hidden bg-[#1C1C1F] transition hover:brightness-[1.03]",
              coverHeightClass,
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${COVER_PLACEHOLDER_BG})` }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/10 to-black/20 transition group-hover:from-black/25" />
            <span className="relative z-10 inline-flex items-center gap-2 text-[13px] text-foreground/75 transition group-hover:text-foreground/90">
              <ImageIcon className="h-4 w-4 text-foreground/50" strokeWidth={1.75} />
              <span className="relative">
                {required && (
                  <Asterisk className="absolute -left-3 -top-2 h-3 w-3 text-[#F96859]" />
                )}
                썸네일 추가하기 (JPG, PNG, GIF…)
              </span>
            </span>
          </button>
          <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </div>
      );
    }

    return (
      <div className={cn("group relative w-full overflow-hidden bg-muted/15", coverHeightClass)}>
        <img src={imageSrc} alt="thumbnail" className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-end justify-end gap-1.5 p-3 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <button
            type="button"
            onClick={openPicker}
            className="rounded-md bg-background/90 px-2.5 py-1 text-[12px] text-foreground shadow-sm transition hover:bg-background"
          >
            변경
          </button>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="flex items-center gap-1 rounded-md bg-background/90 px-2.5 py-1 text-[12px] text-foreground shadow-sm transition hover:bg-background"
          >
            <ImageOff className="h-3 w-3" />
            제거
          </button>
        </div>
        <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
      </div>
    );
  }

  const imageClass = cn(
    "w-full object-cover",
    fill ? "h-full min-h-[160px]" : "aspect-video rounded-lg border",
  );

  const handleRenderPreview = () => {
    if (imageSrc) {
      return <img src={imageSrc} alt="thumbnail" className={imageClass} />;
    }

    return (
      <div
        className={cn(
          "flex w-full cursor-pointer items-center justify-center rounded-lg bg-card",
          fill ? "h-full min-h-[160px]" : "aspect-video",
        )}
        onClick={openPicker}
        onKeyDown={(e) => e.key === "Enter" && openPicker()}
        role="button"
        tabIndex={0}
      >
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className={cn(fill && "flex h-full min-h-0 flex-1 flex-col")}>
      {handleRenderPreview()}
      <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
    </div>
  );
}
