import Link from "next/link";
import PublicAuthShell from "../_components/public-auth-shell";

export default function LoginPage() {
  return (
    <PublicAuthShell
      eyebrow="WELCOME BACK"
      title="Good to see you."
      description="When account access is ready, you’ll be able to pick up where your story left off."
      footerPrompt="New to Eluda?"
      footerLink="Create an account"
      footerHref="/register"
    >
      <form className="space-y-5" aria-describedby="login-status">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#39233a]">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" disabled className="min-h-12 w-full rounded-xl border border-[#e6d7df] bg-[#fbf8f6] px-4 text-base text-[#28142b] outline-none placeholder:text-[#a18d9c] disabled:cursor-not-allowed disabled:opacity-80" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#39233a]">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" disabled className="min-h-12 w-full rounded-xl border border-[#e6d7df] bg-[#fbf8f6] px-4 text-base text-[#28142b] outline-none placeholder:text-[#a18d9c] disabled:cursor-not-allowed disabled:opacity-80" />
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-[#806e7e]">Forgot your password?</span>
          <span className="font-medium text-[#9a527d]">Recovery coming later</span>
        </div>
        <button type="button" disabled className="min-h-14 w-full cursor-not-allowed rounded-full bg-[#4a2148] px-6 text-base font-semibold text-white opacity-60">Log in · Not available yet</button>
      </form>
    </PublicAuthShell>
  );
}
