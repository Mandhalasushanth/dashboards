import { useAuthStore } from "../../authentication/store/authStore";
import { useApplicationStore } from "../../../store/applicationStore";

export function useCustomer() {
  const { customer, logout, setAvatar } = useAuthStore();
  const applications = useApplicationStore((state) => state.applications);

  const allDocuments = applications.flatMap((app) => app.documents);
  const hasUploaded = (keyword: string) =>
    allDocuments.some(
      (doc) =>
        doc.name.toLowerCase().includes(keyword) && doc.status === "Uploaded"
    );
  const kycVerified = hasUploaded("pan") && hasUploaded("aadhaar");

  return {
    customer,
    logout,
    setAvatar,
    kycVerified,
    applications,
  };
}

export default useCustomer;
