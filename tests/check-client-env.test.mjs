import { describe, expect, it } from "vitest";
import { findServerEnvInClientSource } from "../scripts/check-client-env.mjs";

describe("findServerEnvInClientSource", () => {
  it("flags a non-public env var name in a client component", () => {
    const source = '"use client";\nconst key = process.env.SOME_SERVER_ONLY_NAME;\n';
    expect(findServerEnvInClientSource(source, "app/x.tsx")).toEqual([
      "app/x.tsx:2: process.env.SOME_SERVER_ONLY_NAME",
    ]);
  });

  it("flags bracket access and whole-object use", () => {
    const source =
      '"use client";\nconst a = process.env["ANOTHER_SERVER_ONLY_NAME"];\nconst b = process.env;\n';
    expect(findServerEnvInClientSource(source, "app/y.tsx")).toEqual([
      "app/y.tsx:2: process.env.ANOTHER_SERVER_ONLY_NAME",
      "app/y.tsx:3: process.env used as a whole object",
    ]);
  });

  it("allows NEXT_PUBLIC_ names and NODE_ENV", () => {
    const source =
      '"use client";\nconst a = process.env.NEXT_PUBLIC_EXAMPLE;\nconst b = process.env.NODE_ENV;\n';
    expect(findServerEnvInClientSource(source, "app/z.tsx")).toEqual([]);
  });

  it("ignores files that are not client components", () => {
    const source = "const key = process.env.SOME_SERVER_ONLY_NAME;\n";
    expect(findServerEnvInClientSource(source, "app/server.ts")).toEqual([]);
  });

  it("recognises the directive after leading comments", () => {
    const source = '// note\n/* block */\n"use client";\nconst k = process.env.SOME_SERVER_ONLY_NAME;\n';
    expect(findServerEnvInClientSource(source, "app/c.tsx")).toEqual([
      "app/c.tsx:4: process.env.SOME_SERVER_ONLY_NAME",
    ]);
  });
});
