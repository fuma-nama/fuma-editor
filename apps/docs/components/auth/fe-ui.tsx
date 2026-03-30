import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export function FeInput({ className, ...props }: ComponentPropsWithoutRef<"input">) {
  return (
    <input
      className={cn(
        "w-full rounded-fe border border-fe-border bg-fe-input px-3 py-2 text-sm text-fe-foreground outline-none placeholder:text-fe-muted-foreground focus:border-fe-ring",
        className,
      )}
      {...props}
    />
  );
}

type FeButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary";
};

export function FeButton({ variant = "secondary", className, type, ...props }: FeButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        "rounded-fe px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary"
          ? "bg-fe-primary text-fe-primary-foreground hover:opacity-90"
          : "border border-fe-border bg-fe-secondary text-fe-secondary-foreground hover:bg-fe-accent",
        className,
      )}
      {...props}
    />
  );
}

export function FeLabel({ className, ...props }: ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={cn("text-xs font-medium text-fe-muted-foreground", className)}
      {...props}
    />
  );
}

export function FeAuthCard({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-fe-lg border border-fe-border bg-fe-card p-6 text-fe-card-foreground",
        className,
      )}
      {...props}
    />
  );
}
