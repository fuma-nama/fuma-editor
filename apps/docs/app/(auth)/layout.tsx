import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-fe-background px-4 py-12 text-fe-foreground">
      {children}
    </div>
  );
}
