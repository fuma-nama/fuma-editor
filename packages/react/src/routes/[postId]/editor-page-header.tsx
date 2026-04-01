"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";

export function EditorPageHeader({ title, slug }: { title: string; slug: string }) {
  return (
    <header className="flex items-center justify-between gap-3 mb-8">
      <div>
        <p className="text-xs uppercase tracking-wide text-fe-muted-foreground">Editor</p>
        <h1 className="mt-1 text-lg font-semibold text-fe-foreground">{title}</h1>
        <p className="mt-1 text-sm text-fe-muted-foreground">/{slug}</p>
      </div>
      <Link href="/cms" className={cn(buttonVariants())}>
        Back to dashboard
      </Link>
    </header>
  );
}
