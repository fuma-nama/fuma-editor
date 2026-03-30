"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { FeAuthCard, FeButton, FeInput, FeLabel } from "@/components/auth/fe-ui";
import { authClient } from "@/lib/auth.client";

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("callbackUrl") ?? "/cms";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    startTransition(async () => {
      const { error: err } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: nextPath,
      });
      if (err) {
        setError(err.message ?? "Could not create account.");
        return;
      }
      router.push(nextPath);
      router.refresh();
    });
  }

  return (
    <FeAuthCard>
      <p className="text-[11px] uppercase tracking-[0.18em] text-fe-muted-foreground">Account</p>
      <h1 className="mt-2 text-lg font-semibold text-fe-foreground">Create account</h1>
      <p className="mt-1 text-sm text-fe-muted-foreground">Sign up to edit content in the CMS.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="flex flex-col gap-1.5">
          <FeLabel htmlFor="sign-up-name">Name</FeLabel>
          <FeInput
            id="sign-up-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            placeholder="Ada Lovelace"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FeLabel htmlFor="sign-up-email">Email</FeLabel>
          <FeInput
            id="sign-up-email"
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
          <FeLabel htmlFor="sign-up-password">Password</FeLabel>
          <FeInput
            id="sign-up-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <FeLabel htmlFor="sign-up-confirm">Confirm password</FeLabel>
          <FeInput
            id="sign-up-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(ev) => setConfirm(ev.target.value)}
          />
        </div>
        {error ? <p className="text-xs text-fe-destructive">{error}</p> : null}
        <FeButton variant="primary" type="submit" className="w-full py-2" disabled={pending}>
          {pending ? "Creating account…" : "Sign up"}
        </FeButton>
      </form>

      <p className="mt-6 text-center text-xs text-fe-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-fe-foreground underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </FeAuthCard>
  );
}
