import { useState, useEffect } from "react";
import { companyRegistrationApi } from "../services/companyRegistrationApi";

export function useRegistrationStatus(applicationId?: string) {
  const [status, setStatus] = useState<string>("In Process");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!applicationId) return;
    setLoading(true);
    companyRegistrationApi
      .fetchStatus(applicationId)
      .then((res) => {
        if (res?.status) setStatus(res.status);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [applicationId]);

  return {
    status,
    loading,
  };
}

export default useRegistrationStatus;
