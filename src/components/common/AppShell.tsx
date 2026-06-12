import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { useSidebarStore } from "@/stores";
import { DEFAULT_CATEGORY, getCategoryAddLabel } from "@/constants/category.constant";

function AppShell() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebarStore();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isTopicCreate = /\/topics\/\d+\/create$/.test(location.pathname);
  const createCategoryLabel = isTopicCreate
    ? getCategoryAddLabel(searchParams.get("category") ?? DEFAULT_CATEGORY)
    : null;

  return (
    <div className="flex min-h-dvh w-full overflow-hidden">
      <AppSidebar />

      <div className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[width] duration-200 ease-out">
        {collapsed && !mobileOpen && (
          <header className="flex h-12 shrink-0 items-center border-b border-border bg-background px-3 lg:hidden">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-foreground transition hover:bg-muted/80"
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="ml-2.5 truncate text-sm font-semibold text-foreground">
              My Page
              {createCategoryLabel && (
                <span className="ml-1.5 font-normal text-muted-foreground">({createCategoryLabel})</span>
              )}
            </span>
          </header>
        )}

        <main className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { AppShell };
