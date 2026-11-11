import { authService } from "../../authentication/services/authService";
import type { Customer, CustomerProfile } from "../types/customer.types";

export const customerService = {
  getProfile: (): Customer | null => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    return {
      name: user.name,
      email: user.email,
      dob: user.dob || "",
      pan: user.pan || "",
      aadhaar: user.aadhaar || "",
      address: user.address || "",
      customerType: user.customerType || "Individual",
      mobile: user.mobileNumber,
      customerId: user.customerId,
      avatarUri: user.avatarUri,
    };
  },
  updateProfile: async (profile: Partial<CustomerProfile>): Promise<{ success: boolean }> => {
    return { success: true };
  },
};

export default customerService;
