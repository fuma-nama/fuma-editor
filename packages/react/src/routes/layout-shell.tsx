"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useCmsStore } from "@/data/cms-store";
import { useCmsSession } from "@/routes/cms-session-context";
import { cva } from "class-variance-authority";
import { SettingsIcon, LayoutDashboardIcon } from "lucide-react";

interface LayoutShellProps {
  children: React.ReactNode;
}

const sidebarItemVariants = cva(
  "flex text-sm flex-row items-center gap-2 px-2 py-1.5 [&_svg]:size-4",
  {
    variants: {
      active: {
        true: "bg-fe-sidebar-primary/15 text-fe-sidebar-primary",
        false:
          "text-fe-sidebar-foreground/80 hover:bg-fe-sidebar-accent hover:text-fe-sidebar-accent-foreground",
      },
    },
  },
);

export function LayoutShell({ children }: LayoutShellProps) {
  const { workspace, user } = useCmsSession();
  const pathname = usePathname();
  const postIds = useCmsStore((state) => state.postIds);
  const postsById = useCmsStore((state) => state.postsById);
  const posts = postIds.flatMap((id) => postsById[id] ?? []);

  return (
    <div className="grid size-full bg-fe-background text-fe-foreground lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 flex h-dvh flex-col overflow-y-auto border-b border-fe-sidebar-border bg-fe-sidebar p-4 text-fe-sidebar-foreground lg:border-b-0 lg:border-r">
        <div className="flex flex-col gap-2 rounded-lg border border-fe-sidebar-border bg-fe-sidebar-primary/5 p-2">
          <p className="text-sm font-medium">{workspace.name}</p>
          <p className="text-xs text-fe-sidebar-foreground/70">{workspace.slug}</p>
        </div>

        <nav className="mt-6 flex flex-col divide-y divide-fe-sidebar-border overflow-hidden rounded-lg border border-fe-sidebar-border bg-fe-sidebar-primary/5">
          <Link href="/cms" className={cn(sidebarItemVariants({ active: pathname === "/cms" }))}>
            <LayoutDashboardIcon />
            Dashboard
          </Link>
          <Link
            href="/cms/settings"
            className={cn(sidebarItemVariants({ active: pathname.startsWith("/cms/settings") }))}
          >
            <SettingsIcon />
            Settings
          </Link>
        </nav>

        <div className="mt-6 flex flex-col divide-y divide-fe-sidebar-border overflow-hidden rounded-lg border border-fe-sidebar-border bg-fe-sidebar-primary/5">
          <p className="p-2 text-xs font-medium">Posts</p>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/cms/posts/${post.id}`}
              className={cn(sidebarItemVariants({ active: pathname === `/cms/posts/${post.id}` }))}
              title={post.title}
            >
              {post.title}
            </Link>
          ))}
          {posts.length === 0 ? (
            <p className="bg-fe-sidebar-accent/15 px-2 py-1.5 text-sm text-fe-sidebar-foreground/70">
              No posts yet.
            </p>
          ) : null}
        </div>

        <div className="mt-auto hidden border-t border-fe-sidebar-border pt-4 text-xs text-fe-sidebar-foreground/65 lg:block">
          <p className="truncate">{user.email ?? user.id}</p>
          <p className="mt-0.5">Workspace member</p>
        </div>
      </aside>

      <div className="flex flex-col px-(--viewport-padding) [--viewport-padding:--spacing(4)] lg:[--viewport-padding:--spacing(6)]">
        <header className="sticky text-xs top-0 mb-4 shrink-0 border-b border-fe-border bg-fe-card px-(--viewport-padding) py-4 -mx-(--viewport-padding)">
          CMS
        </header>

        {children}
      </div>
    </div>
  );
}
