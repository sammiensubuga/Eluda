import type { OnboardingFieldErrors } from "./validation";

export type OnboardingValues = {
  gender?: string;
  dateOfBirth?: string;
  displayName?: string;
  intent?: string;
};

export type OnboardingState = {
  status: "idle" | "error";
  message: string;
  fieldErrors?: OnboardingFieldErrors;
  values?: OnboardingValues;
};

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  status: "idle",
  message: "",
};
