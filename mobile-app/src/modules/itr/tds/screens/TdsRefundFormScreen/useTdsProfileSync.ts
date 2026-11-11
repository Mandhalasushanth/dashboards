import { useState } from "react";
import { useAuthStore } from "@/modules/authentication/store/authStore";
import { authStorage } from "@/modules/authentication/services/authStorage";
import { useCustomerStore } from "@/modules/customer/store/customerStore";
import { authApi } from "@/modules/authentication/services/authApi";
import type { Customer } from "@/shared/types/domain";
import { TdsCustomerIncomeFormData, PersonalDetails } from "../../types/customerIncome.types";

export function useTdsProfileSync(
  setFormData: React.Dispatch<React.SetStateAction<TdsCustomerIncomeFormData>>
) {
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileFetchError, setProfileFetchError] = useState<string | null>(null);

  const fetchAndPopulateProfile = async (): Promise<PersonalDetails | null> => {
    setIsProfileLoading(true);
    setProfileFetchError(null);
    try {
      useAuthStore.getState().syncFromDevAuth();
      const currentAuthUser = useAuthStore.getState().authenticatedUser;
      let currentCustomer = useAuthStore.getState().customer;

      const activeMobile =
        currentCustomer?.mobile ||
        (currentAuthUser as any)?.mobileNumber ||
        (currentAuthUser as any)?.mobile ||
        authStorage.getSession().activeMobile ||
        useAuthStore.getState().mobileNumber;

      const activeCustId =
        currentCustomer?.customerId ||
        (currentAuthUser as any)?.customerId ||
        (currentAuthUser as any)?.custId;

      const cleanMob = activeMobile ? String(activeMobile).replace(/\D/g, "").slice(-10) : "";

      let apiRes: any = null;
      const lookupId = activeCustId || cleanMob;
      if (lookupId) {
        const backendRes = await authApi.getCustomerDetails(lookupId);
        if (backendRes.success && backendRes.data) {
          apiRes = backendRes.data;
        }
      }

      if (!apiRes) {
        apiRes = (cleanMob ? authStorage.getUserByMobile(cleanMob) : null) || authStorage.getUser();
      }

      if (apiRes && (apiRes.name || apiRes.fullName || apiRes.mobileNumber || apiRes.mobile || apiRes.pan || apiRes.aadhaar)) {
        const mergedCust: Customer = {
          name: apiRes.name || apiRes.fullName || currentCustomer?.name || "",
          email: apiRes.email || currentCustomer?.email || "",
          mobile: apiRes.mobileNumber || apiRes.mobile || currentCustomer?.mobile || activeMobile || "",
          pan: apiRes.pan || currentCustomer?.pan || "",
          aadhaar: apiRes.aadhaar || currentCustomer?.aadhaar || "",
          dob: apiRes.dob || apiRes.dateOfBirth || currentCustomer?.dob || "",
          customerType: apiRes.customerType || apiRes.custType || currentCustomer?.customerType || "Individual",
          addressLine1: apiRes.addressLine1 || currentCustomer?.addressLine1 || "",
          addressLine2: apiRes.addressLine2 || currentCustomer?.addressLine2 || "",
          city: apiRes.city || currentCustomer?.city || "",
          state: apiRes.state || currentCustomer?.state || "",
          pincode: apiRes.pincode || apiRes.pinCode || currentCustomer?.pincode || "",
          address: apiRes.address || currentCustomer?.address || "",
          customerId: apiRes.custId || apiRes.customerId || currentCustomer?.customerId || activeCustId || "",
          avatarUri: currentCustomer?.avatarUri || null,
          profileCompleted: true,
          hasPasscode: currentCustomer?.hasPasscode ?? Boolean(currentAuthUser?.passcode),
        };
        currentCustomer = mergedCust;
        useAuthStore.setState({ customer: mergedCust, profileCompleted: true });
        try {
          useCustomerStore.getState().setProfile(mergedCust);
        } catch {}
      }

      if (!currentCustomer && !currentAuthUser && !apiRes) {
        setProfileFetchError("Unable to load your profile information.");
        return null;
      }

      const rawPan = apiRes?.pan || currentCustomer?.pan || (currentAuthUser as any)?.pan || "";
      const rawAadhaar = apiRes?.aadhaar || currentCustomer?.aadhaar || (currentAuthUser as any)?.aadhaar || "";
      const rawDob = apiRes?.dob || apiRes?.dateOfBirth || currentCustomer?.dob || (currentAuthUser as any)?.dob || "";
      // BUG_B25_002: API returns YYYY-MM-DD; normalize to DD-MM-YYYY so the edit form and
      // validation (which expect DD-MM-YYYY) see the correct format
      let normalizedDob = rawDob;
      if (rawDob) {
        const apiFormat = /^(\d{4})-(\d{2})-(\d{2})$/.exec(rawDob.trim());
        if (apiFormat) {
          normalizedDob = `${apiFormat[3]}-${apiFormat[2]}-${apiFormat[1]}`;
        }
      }
      const rawMobile = apiRes?.mobileNumber || apiRes?.mobile || currentCustomer?.mobile || (currentAuthUser as any)?.mobileNumber || "";
      const rawEmail = apiRes?.email || currentCustomer?.email || (currentAuthUser as any)?.email || "";
      const rawName = apiRes?.name || apiRes?.fullName || currentCustomer?.name || (currentAuthUser as any)?.name || "";

      let rawAddress = apiRes?.addressLine1 || currentCustomer?.addressLine1 || apiRes?.address || currentCustomer?.address || "";
      if (apiRes?.addressLine2 || currentCustomer?.addressLine2) {
        const line2 = apiRes?.addressLine2 || currentCustomer?.addressLine2;
        rawAddress = rawAddress ? `${rawAddress}, ${line2}` : line2;
      }

      const rawCity = apiRes?.city || currentCustomer?.city || "";
      const rawState = apiRes?.state || currentCustomer?.state || "";
      const rawPin = apiRes?.pincode || apiRes?.pinCode || currentCustomer?.pincode || "";

      const populatedPersonal: PersonalDetails = {
        fullName: rawName,
        pan: rawPan,
        aadhaar: rawAadhaar,
        dob: normalizedDob,
        mobileNumber: rawMobile,
        email: rawEmail,
        residentialAddress: rawAddress,
        city: rawCity,
        state: rawState,
        pinCode: rawPin,
      };

      setFormData((prev) => ({
        ...prev,
        personal: populatedPersonal,
        bank: {
          ...prev.bank,
          accountHolderName: prev.bank.accountHolderName || rawName,
        },
      }));

      return populatedPersonal;
    } catch (e: any) {
      setProfileFetchError(e?.message || "Failed to load profile.");
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  };

  return { isProfileLoading, profileFetchError, fetchAndPopulateProfile };
}
