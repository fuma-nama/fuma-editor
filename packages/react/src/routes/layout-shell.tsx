"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useCmsStore } from "@/data/cms-store";
import { cva } from "class-variance-authority";

interface LayoutShellProps {
  workspace: {
    name: string;
    slug: string;
  };
  user: {
    id: string;
    email: string | null;
  };
  children: React.ReactNode;
}

const sidebarItemVariants = cva("flex text-sm flex-row items-center gap-2 px-2 py-1.5", {
  variants: {
    active: {
      true: "bg-fe-primary/10 text-fe-primary",
      false: "text-fe-muted-foreground hover:bg-fe-accent",
    },
  },
});

export function LayoutShell({ workspace, user, children }: LayoutShellProps) {
  const pathname = usePathname();
  const postIds = useCmsStore((state) => state.postIds);
  const postsById = useCmsStore((state) => state.postsById);
  const posts = postIds.flatMap((id) => postsById[id] ?? []);

  return (
    <div className="grid size-full bg-fe-background lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 flex h-dvh flex-col overflow-y-auto border-b border-fe-border bg-fe-card/70 p-4 lg:border-b-0 lg:border-r">
        <div className="flex flex-col gap-2 border border-fe-border rounded-lg p-2 bg-fe-card text-fe-card-foreground">
          <p className="text-sm font-medium text-fe-foreground">{workspace.name}</p>
          <p className="text-xs text-fe-muted-foreground">{workspace.slug}</p>
        </div>

        <nav className="mt-6 flex flex-col divide-y divide-fe-border rounded-lg overflow-hidden border border-fe-border bg-fe-card text-fe-card-foreground">
          <Link href="/cms" className={cn(sidebarItemVariants({ active: pathname === "/cms" }))}>
            Dashboard
          </Link>
          <Link
            href="/cms/settings"
            className={cn(sidebarItemVariants({ active: pathname.startsWith("/cms/settings") }))}
          >
            Settings
          </Link>
        </nav>

        <div className="mt-6 flex flex-col rounded-lg border border-fe-border bg-fe-card text-fe-card-foreground divide-y divide-fe-border overflow-hidden">
          <p className="text-xs font-medium text-fe-foreground p-2">Posts</p>
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
            <p className="text-xs text-fe-muted-foreground">No posts yet.</p>
          ) : null}
        </div>

        <div className="mt-auto hidden border-t border-fe-border pt-4 text-xs text-fe-muted-foreground lg:block">
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
