import { useCallback, useEffect, useState } from "react";
import type { VerifyPermitResponse } from "../types/api";

const STORAGE_KEY = "shop_verified_context_v1";

export interface ShopVerifiedContext {
  qrToken: string;
  verifiedAt: string;
  result: VerifyPermitResponse;
}

function readContext(): ShopVerifiedContext | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ShopVerifiedContext;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeContext(value: ShopVerifiedContext | null): void {
  if (typeof window === "undefined") return;
  if (!value) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function useShopVerifiedContext() {
  const [context, setContext] = useState<ShopVerifiedContext | null>(null);

  useEffect(() => {
    setContext(readContext());
  }, []);

  const save = useCallback((value: ShopVerifiedContext) => {
    writeContext(value);
    setContext(value);
  }, []);

  const clear = useCallback(() => {
    writeContext(null);
    setContext(null);
  }, []);

  return {
    context,
    hasContext: context !== null,
    save,
    clear,
  };
}
