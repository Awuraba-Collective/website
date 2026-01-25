"use client";

import { AppProgressProvider as ProgressProvider } from "@bprogress/next";

export function RouteLoader({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider
      height="6px"
      color="#000"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </ProgressProvider>
  );
}
