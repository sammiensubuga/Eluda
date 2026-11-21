import { Suspense } from "react";

import { SignInNotice } from "../auth-forms";
import { AuthPage } from "../auth-page";

export default function SignInPage() {
  return (
    <Suspense fallback={<AuthPage kind="sign-in" />}>
      <AuthPage kind="sign-in">
        <SignInNotice />
      </AuthPage>
    </Suspense>
  );
}
