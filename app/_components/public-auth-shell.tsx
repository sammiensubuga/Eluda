import Link from "next/link";
import type { ReactNode } from "react";

type PublicAuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footerPrompt: string;
  footerLink: string;
  footerHref: string;
};

export default function PublicAuthShell({
  eyebrow,
  title,
  description,
  children,
  footerPrompt,
  footerLink,
  footerHref,
}: PublicAuthShellProps) {
  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#fbf6f0] text-[#28142b]">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#e8b4c5]/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-[#d8c2df]/50 blur-3xl" />
      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Eluda home" className="flex items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9a527d]">
          <img src="/eluda-mark.svg" alt="" className="h-11 w-11 rounded-xl object-contain" />
          <span className="text-xl font-semibold tracking-[0.08em]">Eluda</span>
        </Link>
        <Link href="/" className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#63345d] transition hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a527d]">
          Back to home
        </Link>
      </header>

      <section className="relative flex flex-1 items-center justify-center px-5 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-5 text-center">
            <p className="mb-3 inline-flex items-center rounded-full border border-[#d8bdc8] bg-white/65 px-3.5 py-2 text-xs font-semibold tracking-[0.12em] text-[#63345d]">{eyebrow}</p>
            <h1 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{title}</h1>
            <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-[#6f5b6d]">{description}</p>
          </div>

          <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-2xl shadow-[#4a2148]/10 backdrop-blur sm:p-8">
            {children}
            <div className="mt-6 rounded-xl border border-[#eadde3] bg-[#fbf6f0] px-4 py-3 text-sm leading-6 text-[#6f5b6d]" role="status">
              Account access is not connected yet. This page is a preview; submitting details is currently unavailable.
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[#6f5b6d]">
            {footerPrompt}{" "}
            <Link href={footerHref} className="font-semibold text-[#63345d] underline decoration-[#cda7bc] underline-offset-4 hover:text-[#4a2148] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9a527d]">
              {footerLink}
            </Link>
          </p>
          <p className="mt-8 text-center text-xs text-[#8b7988]">For adults 18+ · Your comfort and privacy matter</p>
        </div>
      </section>
    </main>
  );
}
