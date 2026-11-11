import React, { useEffect } from "react";
import { ItrFilingScreen } from "@/modules/itr/itr-filing";
import { useITRStore } from "@/modules/itr/store/itrStore";

export default function ItrIncomeInfoRoute() {
  const setStep = useITRStore((state) => state.setStep);
  useEffect(() => {
    setStep(1);
  }, []);
  return <ItrFilingScreen />;
}
