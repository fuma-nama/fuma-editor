"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FeAuthCard, FeButton, FeInput, FeLabel } from "@/components/auth/fe-ui";
import { authClient } from "@/lib/auth.client";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("callbackUrl") ?? "/cms";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error: err } = await authClient.signIn.email({
        email,
        password,
        callbackURL: nextPath,
      });
      if (err) {
        setError(err.message ?? "Could not sign in.");
        return;
      }
      router.push(nextPath);
      router.refresh();
    });
  }

  return (
    <FeAuthCard>
      <p className="text-[11px] uppercase tracking-[0.18em] text-fe-muted-foreground">Account</p>
      <h1 className="mt-2 text-lg font-semibold text-fe-foreground">Sign in</h1>
      <p className="mt-1 text-sm text-fe-muted-foreground">Use your email and password to access the CMS.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-1.5">
          <FeLabel htmlFor="sign-in-email">Email</FeLabel>
          <FeInput
            id="sign-in-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FeLabel htmlFor="sign-in-password">Password</FeLabel>
          <FeInput
            id="sign-in-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </div>
        {error ? <p className="text-xs text-fe-destructive">{error}</p> : null}
        <FeButton variant="primary" type="submit" className="w-full py-2" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </FeButton>
      </form>

      <p className="mt-6 text-center text-xs text-fe-muted-foreground">
        No account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-fe-foreground underline-offset-2 hover:underline"
        >
          Create one
        </Link>
      </p>
    </FeAuthCard>
  );
}
