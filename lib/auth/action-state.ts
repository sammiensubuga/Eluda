export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
  email?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = {
  status: "idle",
  message: "",
};

export function getAuthNotice(code: string | null): { status: "error" | "success"; message: string } | null {
  if (code === "confirmation") {
    return {
      status: "error",
      message: "That link is invalid, expired or already used. If you already confirmed your email, sign in below. To reset your password, use “Forgot password?”.",
    };
  }

  if (code === "password-updated") {
    return {
      status: "success",
      message: "Your password has been updated. Sign in with your new password.",
    };
  }

  return null;
}
