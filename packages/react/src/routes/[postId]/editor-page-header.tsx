"use client";

import Link from "next/link";
import { useCmsSession } from "@/routes/cms-session-context";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";

export function EditorPageHeader({ title, slug }: { title: string; slug: string }) {
  const { membershipRole } = useCmsSession();

  return (
    <header className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-fe-muted-foreground">Editor</p>
        <h1 className="mt-1 text-lg font-semibold text-fe-foreground">{title}</h1>
        <p className="mt-1 text-sm text-fe-muted-foreground">
          /{slug} - {membershipRole}
        </p>
      </div>
      <Link href="/cms" className={cn(buttonVariants())}>
        Back to dashboard
      </Link>
    </header>
  );
}
