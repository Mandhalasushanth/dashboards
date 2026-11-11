import { useState } from "react";
import type { ItrFilingDraft } from "../types/itr.types";

export function useITR() {
  const [draft, setDraft] = useState<Partial<ItrFilingDraft>>({});

  const updateDraft = (updates: Partial<ItrFilingDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  return {
    draft,
    updateDraft,
  };
}

export default useITR;
