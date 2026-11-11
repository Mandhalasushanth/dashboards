import type { CustomerProfile } from "../types/customer.types";
import { authStorage } from "../../authentication/services/authStorage";

export const customerApi = {
  getProfile: async (identifier?: string): Promise<any> => {
    const cleanMobile = identifier ? String(identifier).replace(/\D/g, "") : "";
    const user = (cleanMobile ? authStorage.getUserByMobile(cleanMobile) : null) || authStorage.getUser();
    const session = authStorage.getSession();

    if (!user) {
      return null;
    }

    const custId = user.customerId || user.custId || session?.activeCustId || "";
    const mobile = user.mobileNumber || user.mobile || session.activeMobile || cleanMobile || "";
    const name = user.name || user.fullName || "";
    const pin = user.pincode || user.pinCode || "";

    return {
      ...user,
      customerId: custId,
      custId: custId,
      mobile: mobile,
      mobileNumber: mobile,
      name: name,
      fullName: name,
      aadhaar: user.aadhaar || user.adhar || "",
      pan: user.pan || "",
      dob: user.dob || user.dateOfBirth || "",
      pincode: pin,
      pinCode: pin,
      customerType: user.customerType || user.custType || "Individual",
    };
  },

  updateProfile: async (profile: Partial<CustomerProfile> & { custId?: string; mobileNumber?: string }) => {
    const user = authStorage.getUser();
    const session = authStorage.getSession();
    const resolvedMobile =
      profile.mobileNumber ||
      user?.mobileNumber ||
      user?.mobile ||
      session.activeMobile ||
      "";

    const resolvedCustId =
      profile.custId ||
      user?.customerId ||
      user?.custId ||
      session?.activeCustId ||
      "";

    const updatedUser = {
      ...(user || {}),
      ...profile,
      customerId: resolvedCustId,
      mobileNumber: resolvedMobile,
    };

    if (resolvedMobile) {
      authStorage.saveUser(updatedUser as any);
    }

    return { success: true, data: updatedUser };
  },
};

export default customerApi;
