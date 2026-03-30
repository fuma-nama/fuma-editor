import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Fuma editor CMS",
};

function SignInFallback() {
  return (
    <div className="w-full max-w-sm rounded-fe-lg border border-fe-border bg-fe-card p-6 text-sm text-fe-muted-foreground">
      Loading…
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}
