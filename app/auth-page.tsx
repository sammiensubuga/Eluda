import Link from "next/link";
import type { ReactNode } from "react";

import { AuthForm } from "./auth-forms";

const pageContent = {
  "sign-up": {
    title: "Create your account",
    description: "Start with your email. We’ll send a confirmation link before you sign in.",
  },
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to continue to Eluda.",
  },
  "forgot-password": {
    title: "Reset your password",
    description: "Enter your email and we’ll send a reset link if an account exists.",
  },
  "reset-password": {
    title: "Choose a new password",
    description: "Set a new password for your account.",
  },
} as const;

export function AuthPage({
  kind,
  children,
  title,
  description,
  form,
}: {
  kind: keyof typeof pageContent;
  children?: ReactNode;
  title?: string;
  description?: string;
  form?: ReactNode;
}) {
  const content = pageContent[kind];

  return (
    <main className="min-h-screen bg-[#fbf6f0] px-4 py-8 text-[#28142b] sm:px-6 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <Link className="mb-8 self-center text-xl font-semibold tracking-[0.08em] text-[#4a2148]" href="/">Eluda</Link>
        <section className="rounded-3xl border border-[#eadde3] bg-white/90 p-6 shadow-xl shadow-[#4a2148]/5 sm:p-9">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title ?? content.title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#806e7e]">{description ?? content.description}</p>
          {children}
          {form ?? <AuthForm kind={kind} />}
        </section>
      </div>
    </main>
  );
}
