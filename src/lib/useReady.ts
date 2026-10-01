"use client";

import { useEffect, useState } from "react";

/** True only after client mount (persisted save rehydrated). Gates first render. */
export function useReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}
