import { Suspense } from "react";

import { ProtectedDiscoverContent } from "./protected-content";

export default function DiscoverPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fbf6f0]" aria-busy="true" />}>
      <ProtectedDiscoverContent />
    </Suspense>
  );
}
