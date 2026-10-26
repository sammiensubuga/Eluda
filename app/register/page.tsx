import PublicAuthShell from "../_components/public-auth-shell";

export default function RegisterPage() {
  return (
    <PublicAuthShell
      eyebrow="YOUR NEXT CHAPTER"
      title="Start with you."
      description="Make room for a connection that feels right, at a pace that feels like yours."
      footerPrompt="Already have an account?"
      footerLink="Log in"
      footerHref="/login"
    >
      <form className="space-y-5" aria-describedby="register-status">
        <fieldset disabled className="space-y-5">
          <legend className="mb-4 text-sm leading-6 text-[#806e7e]">Account setup will begin with the basics.</legend>
          <div>
            <label htmlFor="display-name" className="mb-2 block text-sm font-semibold text-[#39233a]">What should we call you?</label>
            <input id="display-name" name="displayName" type="text" autoComplete="nickname" placeholder="Your display name" className="min-h-12 w-full rounded-xl border border-[#e6d7df] bg-[#fbf8f6] px-4 text-base text-[#28142b] outline-none placeholder:text-[#a18d9c] disabled:cursor-not-allowed disabled:opacity-80" />
          </div>
          <div>
            <span className="mb-2 block text-sm font-semibold text-[#39233a]">Gender</span>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#e6d7df] bg-[#fbf8f6] px-4 text-sm text-[#6f5b6d]"><input type="radio" name="gender" value="female" /> Female</label>
              <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#e6d7df] bg-[#fbf8f6] px-4 text-sm text-[#6f5b6d]"><input type="radio" name="gender" value="male" /> Male</label>
            </div>
          </div>
          <div>
            <label htmlFor="register-email" className="mb-2 block text-sm font-semibold text-[#39233a]">Email address</label>
            <input id="register-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className="min-h-12 w-full rounded-xl border border-[#e6d7df] bg-[#fbf8f6] px-4 text-base text-[#28142b] outline-none placeholder:text-[#a18d9c] disabled:cursor-not-allowed disabled:opacity-80" />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-2 block text-sm font-semibold text-[#39233a]">Create a password</label>
            <input id="register-password" name="password" type="password" autoComplete="new-password" placeholder="Choose a strong password" className="min-h-12 w-full rounded-xl border border-[#e6d7df] bg-[#fbf8f6] px-4 text-base text-[#28142b] outline-none placeholder:text-[#a18d9c] disabled:cursor-not-allowed disabled:opacity-80" />
          </div>
        </fieldset>
        <button type="button" disabled className="min-h-14 w-full cursor-not-allowed rounded-full bg-[#4a2148] px-6 text-base font-semibold text-white opacity-60">Create account · Not available yet</button>
        <p className="text-center text-xs leading-5 text-[#806e7e]">Eluda is intended for adults aged 18 and above.</p>
      </form>
    </PublicAuthShell>
  );
}
