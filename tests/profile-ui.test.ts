import { describe, expect, it } from "vitest";

import {
  canDeletePhoto,
  contrastRatio,
  isProfileFormDirty,
  publishActionModel,
  publishReason,
} from "../app/profile/profile-copy";

const ivory = "#FBF6F0";
const white = "#FFFFFF";

describe("profile UI decision helpers", () => {
  it("explains how many photos remain before publishing is allowed", () => {
    expect(publishReason(0)).toBe("Add 2 more photos to publish.");
    expect(publishReason(1)).toBe("Add 1 more photo to publish.");
    expect(publishReason(2)).toBeNull();
    expect(publishReason(6)).toBeNull();
  });

  it("prevents deleting below the published two-photo minimum", () => {
    expect(canDeletePhoto(false, 0)).toBe(true);
    expect(canDeletePhoto(true, 3)).toBe(true);
    expect(canDeletePhoto(true, 2)).toBe(false);
    expect(canDeletePhoto(true, 1)).toBe(false);
  });

  it("compares trimmed names, intent and availability, including men with no availability", () => {
    const male = { displayName: "  Amina ", intent: "DATING", availability: null };
    expect(isProfileFormDirty(male, { displayName: "Amina", intent: "DATING", availability: null })).toBe(false);
    expect(isProfileFormDirty(male, { displayName: "Amina B", intent: "DATING", availability: null })).toBe(true);
    expect(isProfileFormDirty(male, { displayName: "Amina", intent: "MEETUPS", availability: null })).toBe(true);

    const woman = { displayName: "Amina", intent: "DATING", availability: "AVAILABLE" };
    expect(isProfileFormDirty(woman, { ...woman, availability: "HIDDEN" })).toBe(true);
  });

  it("exposes the correct single primary action state for each visibility case", () => {
    const ready = publishActionModel(false, 3);
    expect(ready).toEqual({ action: "publish", disabled: false, reason: null, primary: true });

    const underMinimum = publishActionModel(false, 1);
    expect(underMinimum).toEqual({
      action: "publish",
      disabled: true,
      reason: "Add 1 more photo to publish.",
      primary: false,
    });

    const published = publishActionModel(true, 6);
    expect(published).toEqual({ action: "unpublish", disabled: false, reason: null, primary: false });
  });

  it("calculates WCAG contrast and checks the approved palette thresholds", () => {
    expect(contrastRatio("#28142B", ivory)).toBeCloseTo(15.95, 1);
    expect(contrastRatio("#4A2148", ivory)).toBeCloseTo(12.2, 1);
    expect(contrastRatio(white, "#4A2148")).toBeCloseTo(13.11, 1);
    expect(contrastRatio("#6F5D6E", ivory)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#6F5D6E", white)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#B42318", ivory)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#146C43", ivory)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#C4476F", ivory)).toBeLessThan(4.5);
    expect(contrastRatio(white, "#C4476F")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#B8893A", ivory)).toBeLessThan(3);
    expect(contrastRatio(white, "#B8893A")).toBeLessThan(4.5);
    expect(contrastRatio("#806E7E", ivory)).toBeLessThan(4.5);
  });
});
