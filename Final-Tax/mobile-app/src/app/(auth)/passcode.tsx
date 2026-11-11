import React, { useEffect } from "react";
import { AuthenticationScreen } from "@/modules/authentication/screens/AuthenticationScreen";
import { useAuthStore } from "@/modules/authentication/store/authStore";

export default function PasscodeRoute() {
  const setAuthFlowState = useAuthStore((state) => state.setAuthFlowState);

  useEffect(() => {
    setAuthFlowState("PASSCODE_LOGIN");
  }, [setAuthFlowState]);

  return <AuthenticationScreen />;
}
