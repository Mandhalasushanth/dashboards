import type { Customer } from "../../../shared/types/domain";
import type { StoredUser } from "../types/auth.types";
import { useNotificationStore } from "../../../store/notificationStore";

/** True for empty names and the generic placeholders the backend returns for unregistered customers. */
export const isPlaceholderCustomerName = (name?: string | null): boolean =>
  !name ||
  name.trim() === "" ||
  name.toLowerCase() === "valued client" ||
  name.toLowerCase() === "client" ||
  name.toLowerCase() === "valued";

export const refreshNotificationsForActiveCustomer = () => {
  useNotificationStore.getState().loadPersisted().catch(() => {});
};


export const toCustomer = (u: StoredUser): Customer => {
  const isPlaceholderName = isPlaceholderCustomerName(u.name);

  const hasBackendIdentity = Boolean(u.customerId && !isPlaceholderName);

  return {
    name: u.name,
    email: u.email,
    dob: u.dob || "",
    gender: u.gender || "",
    fatherSpouseName: u.fatherSpouseName || "",
    pan: u.pan || "",
    aadhaar: u.aadhaar || u.adhar || "",
    address: u.address || "",
    addressLine1: u.addressLine1 || "",
    addressLine2: u.addressLine2 || "",
    city: u.city || "",
    pincode: u.pincode || u.pinCode || "",
    state: u.state || "",
    customerType: u.customerType || "Individual",
    mobile: u.mobileNumber || u.mobile || "",
    customerId: u.customerId || u.custId || "",
    avatarUri: u.avatarUri,
    profileCompleted: Boolean(
      !isPlaceholderName &&
      (
        Boolean(u.customerId && u.customerId.trim() !== "") ||
        Boolean(u.registrationCompleted) ||
        Boolean(u.profileCompleted) ||
        Boolean(u.pan || u.aadhaar || u.adhar)
      )
    ),
    hasPasscode: Boolean(u.passcode || u.hasPasscode || hasBackendIdentity),
  };
};
