"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "../eluda_logo.png";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf6f0] text-[#28142b]">
      <div className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#e8b4c5]/40 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-[26rem] h-72 w-72 rounded-full bg-[#d8c2df]/50 blur-3xl" />
        <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Eluda home" className="flex items-center gap-3">
            <Image src={logo} alt="Eluda logo" className="h-11 w-11 rounded-xl object-contain" preload sizes="44px" />
            <span className="text-xl font-semibold tracking-[0.08em]">Eluda</span>
          </Link>
          <Link href="/login" className="rounded-full border border-[#4a2148]/15 px-4 py-2.5 text-sm font-semibold transition hover:border-[#4a2148]/40 hover:bg-white/70">
            Log in
          </Link>
        </header>

        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-14">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8bdc8] bg-white/65 px-3.5 py-2 text-xs font-semibold tracking-wide text-[#63345d] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#c66b8c]" />
              REAL CONNECTIONS. YOUR PACE.
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Meet someone who feels <span className="font-serif italic text-[#9a527d]">like you.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#6f5b6d] sm:text-lg sm:leading-8">
              A more thoughtful way to find your people. Start with a conversation, build trust, and let a real connection take its time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#4a2148] px-7 text-base font-semibold text-white shadow-xl shadow-[#4a2148]/20 transition hover:-translate-y-0.5 hover:bg-[#5b2a58] focus:outline-none focus:ring-4 focus:ring-[#b87aa5]/40">
                Create your account <span aria-hidden="true">↗</span>
              </Link>
              <span className="px-2 text-sm text-[#806e7e]">Free to get started</span>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#e8dce2] pt-6 text-sm text-[#6f5b6d]">
              <span className="flex items-center gap-2"><span className="text-[#9a527d]">✦</span> Privacy-minded by design</span>
              <span className="flex items-center gap-2"><span className="text-[#9a527d]">✦</span> You choose what to share</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[31rem] lg:ml-auto">
            <div aria-hidden="true" className="absolute -inset-5 rotate-[-5deg] rounded-[2.5rem] bg-gradient-to-br from-[#e8c2d0] via-[#f5e7dd] to-[#cdb6d2] opacity-80" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#ead9df] p-3 shadow-2xl shadow-[#4a2148]/15">
              <div className="relative flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#6d3b65] via-[#a15f83] to-[#e0a5a7] p-6 text-white sm:min-h-[33rem] sm:p-8">
                <div aria-hidden="true" className="absolute -right-12 top-12 h-56 w-56 rounded-full border border-white/20" />
                <div aria-hidden="true" className="absolute -right-2 top-24 h-40 w-40 rounded-full border border-white/20" />
                <div aria-hidden="true" className="absolute -bottom-16 -left-8 h-64 w-64 rounded-full bg-[#f3d5c8]/20 blur-2xl" />
                <div className="relative flex items-center justify-between">
                  <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur">A little more meaningful</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl backdrop-blur" aria-hidden="true">♡</span>
                </div>
                <div className="relative mt-36">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8dfc2] text-xl text-[#4a2148]">✦</div>
                  <p className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Good things begin with hello.</p>
                  <p className="mt-4 max-w-xs text-sm leading-6 text-white/85">No rush. No pressure. Just room for something real.</p>
                </div>
                <div className="relative mt-8 flex items-center justify-between border-t border-white/25 pt-5 text-xs text-white/80">
                  <span>Made for genuine connection</span>
                  <span className="tracking-[0.2em]">Eluda</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-2 rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-xl shadow-[#4a2148]/10 sm:-left-8">
              <p className="text-sm font-semibold text-[#4a2148]">Your story, your pace.</p>
              <p className="mt-0.5 text-xs text-[#806e7e]">Connection starts here</p>
            </div>
          </div>
        </section>

      </div>

      <section className="border-t border-[#eadde3] bg-white/55">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-3 sm:px-8 lg:px-12 lg:py-14">
          <div>
            <p className="text-sm font-semibold text-[#4a2148]">01 / Be yourself</p>
            <h2 className="mt-2 text-lg font-semibold">Show up as you are</h2>
            <p className="mt-2 text-sm leading-6 text-[#806e7e]">Build a profile that reflects you, with control over the details you share.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#4a2148]">02 / Find your people</p>
            <h2 className="mt-2 text-lg font-semibold">Look beyond the scroll</h2>
            <p className="mt-2 text-sm leading-6 text-[#806e7e]">Discover people and make space for conversations that can go somewhere.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#4a2148]">03 / Stay in control</p>
            <h2 className="mt-2 text-lg font-semibold">Your boundaries matter</h2>
            <p className="mt-2 text-sm leading-6 text-[#806e7e]">Sharing more should always be your choice. Your comfort comes first.</p>
          </div>
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-[#8b7988] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span>© 2026 Eluda</span>
        <span>For adults 18+ · Built around choice, respect, and privacy</span>
      </footer>
    </main>
  );
}
