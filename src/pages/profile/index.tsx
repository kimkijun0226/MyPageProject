import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Camera, ChevronDown, CircleUser, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from "@/components/ui";
import { useAuthStore } from "@/stores";
import { useUser } from "@/hooks";
import { userApi } from "@/api";
import { useImageUpload } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys";
import supabase from "@/lib/supabase";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  nickname: z.string().min(1, { message: "닉네임을 입력해주세요." }),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "현재 비밀번호를 입력해주세요." }),
    newPassword: z.string().min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." }),
    confirmPassword: z.string().min(1, { message: "비밀번호 확인을 입력해주세요." }),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({ code: "custom", message: "비밀번호가 일치하지 않습니다.", path: ["confirmPassword"] });
    }
  });

const deleteSchema = z.object({
  confirmText: z.string().min(1, { message: "확인 문구를 입력해주세요." }),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type DeleteForm = z.infer<typeof deleteSchema>;

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      onClick={toggle}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function SettingsRow({
  label,
  onClick,
  destructive,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center px-5 py-3.5 text-left text-sm transition hover:bg-muted/50",
        destructive ? "text-muted-foreground hover:text-destructive" : "text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, reset } = useAuthStore();
  const { userInfo } = useUser();
  const { upload } = useImageUpload();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nickname: "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const deleteForm = useForm<DeleteForm>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { confirmText: "" },
  });

  useEffect(() => {
    if (userInfo) {
      profileForm.reset({ nickname: userInfo.nickname ?? "" });
      setImagePreview(userInfo.profile_image ?? null);
    }
  }, [userInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const provider = data.session?.user?.app_metadata?.provider;
      setIsOAuthUser(provider === "google");
    });
  }, []);

  if (!user?.id) {
    navigate("/sign-in");
    return null;
  }

  const expectedDeleteText = `${user.email} 탈퇴 하는데 동의 합니다.`;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const onProfileSubmit = async (values: ProfileForm) => {
    try {
      let imageUrl = userInfo?.profile_image ?? null;
      if (imageFile) {
        const uploaded = await upload.mutateAsync(imageFile);
        if (uploaded) imageUrl = uploaded;
      }
      await userApi.updateUserInfo(user.id, { nickname: values.nickname, profile_image: imageUrl });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.info(user.id).queryKey });
      setImageFile(null);
      toast.success("저장되었습니다.");
    } catch {
      toast.error("저장에 실패했습니다.");
    }
  };

  const onPasswordSubmit = async (values: PasswordForm) => {
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      });
      if (signInErr) {
        passwordForm.setError("currentPassword", { message: "현재 비밀번호가 올바르지 않습니다." });
        return;
      }
      const { error: updateErr } = await supabase.auth.updateUser({ password: values.newPassword });
      if (updateErr) throw updateErr;
      toast.success("비밀번호가 변경되었습니다.");
      passwordForm.reset();
      setPasswordOpen(false);
    } catch {
      toast.error("비밀번호 변경에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await reset();
      toast.success("로그아웃되었습니다.");
      navigate("/");
    } catch {
      toast.error("로그아웃에 실패했습니다.");
    }
  };

  const onDeleteSubmit = async (values: DeleteForm) => {
    if (values.confirmText !== expectedDeleteText) {
      deleteForm.setError("confirmText", { message: "확인 문구가 일치하지 않습니다." });
      return;
    }
    try {
      await userApi.deleteUserAccount(user.id);
      closeDeleteDialog();
      await reset();
      queryClient.clear();
      toast.success("회원 탈퇴가 완료되었습니다.");
      navigate("/", { replace: true });
    } catch {
      toast.error("회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    deleteForm.reset();
  };

  return (
    <div className="flex h-[calc(100dvh-53px)] min-h-0 flex-col overflow-hidden bg-background lg:h-dvh">
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          title="뒤로가기"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        {imagePreview ? (
          <img src={imagePreview} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <CircleUser className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">프로필 설정</p>
          <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[440px] px-5 py-6">
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="rounded-xl border border-border/50 bg-card/40"
          >
            <div className="flex flex-col items-center gap-4 p-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative shrink-0"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="profile" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <CircleUser className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <Camera className="h-4 w-4 text-white" />
                </span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

              <div className="w-full">
                <Controller
                  name="nickname"
                  control={profileForm.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="gap-1.5">
                      <FieldLabel className="text-xs text-muted-foreground">닉네임</FieldLabel>
                      <Input placeholder="닉네임" className="h-9" {...field} />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </div>
            </div>

            <div className="border-t border-border/50 px-5 py-3">
              <Button type="submit" size="sm" disabled={profileForm.formState.isSubmitting} className="h-8 px-4">
                {profileForm.formState.isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "저장"}
              </Button>
            </div>
          </form>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/50 bg-card/40">
            {!isOAuthUser && (
              <>
                <button
                  type="button"
                  onClick={() => setPasswordOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm hover:bg-muted/50"
                >
                  <span>비밀번호 변경</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition", passwordOpen && "rotate-180")} />
                </button>

                {passwordOpen && (
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-3 border-t border-border/50 px-5 py-4"
                  >
                    <FieldGroup className="gap-3">
                      <Controller
                        name="currentPassword"
                        control={passwordForm.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className="gap-1.5">
                            <FieldLabel className="text-xs text-muted-foreground">현재 비밀번호</FieldLabel>
                            <div className="relative">
                              <Input type={showCurrentPw ? "text" : "password"} className="h-9" {...field} />
                              <EyeBtn show={showCurrentPw} toggle={() => setShowCurrentPw(!showCurrentPw)} />
                            </div>
                            <FieldError>{fieldState.error?.message}</FieldError>
                          </Field>
                        )}
                      />
                      <Controller
                        name="newPassword"
                        control={passwordForm.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className="gap-1.5">
                            <FieldLabel className="text-xs text-muted-foreground">새 비밀번호</FieldLabel>
                            <div className="relative">
                              <Input type={showNewPw ? "text" : "password"} className="h-9" placeholder="8자 이상" {...field} />
                              <EyeBtn show={showNewPw} toggle={() => setShowNewPw(!showNewPw)} />
                            </div>
                            <FieldError>{fieldState.error?.message}</FieldError>
                          </Field>
                        )}
                      />
                      <Controller
                        name="confirmPassword"
                        control={passwordForm.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className="gap-1.5">
                            <FieldLabel className="text-xs text-muted-foreground">확인</FieldLabel>
                            <div className="relative">
                              <Input type={showConfirmPw ? "text" : "password"} className="h-9" {...field} />
                              <EyeBtn show={showConfirmPw} toggle={() => setShowConfirmPw(!showConfirmPw)} />
                            </div>
                            <FieldError>{fieldState.error?.message}</FieldError>
                          </Field>
                        )}
                      />
                    </FieldGroup>
                    <Button type="submit" size="sm" variant="outline" disabled={passwordForm.formState.isSubmitting} className="h-8">
                      {passwordForm.formState.isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "변경"}
                    </Button>
                  </form>
                )}

                <div className="border-t border-border/50" />
              </>
            )}

            <SettingsRow label="로그아웃" onClick={handleLogout} />
            <div className="border-t border-border/50" />
            <SettingsRow label="회원 탈퇴" onClick={() => setDeleteDialogOpen(true)} destructive />
          </div>
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>회원 탈퇴</AlertDialogTitle>
            <AlertDialogDescription>
              모든 데이터가 삭제되며 복구할 수 없습니다. 아래 문구를 입력해 주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs break-all">{expectedDeleteText}</p>

          <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-4">
            <Controller
              name="confirmText"
              control={deleteForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input placeholder="확인 문구 입력" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel type="button" onClick={closeDeleteDialog}>
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                type="submit"
                className="bg-destructive hover:bg-destructive/90"
                disabled={deleteForm.formState.isSubmitting}
              >
                {deleteForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "탈퇴"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
