import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an account for the Fuma editor CMS",
};

function SignUpFallback() {
  return (
    <div className="w-full max-w-sm rounded-lg border border-fe-border bg-fe-card p-6 text-sm text-fe-muted-foreground">
      Loading…
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpForm />
    </Suspense>
  );
}
