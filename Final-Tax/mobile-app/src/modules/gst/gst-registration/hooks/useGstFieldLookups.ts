import { useState, useCallback, useRef, useEffect } from "react";
import { pinCodeService } from "@/shared/services/lookup/pinCodeService";
import { logger } from "@/core/logging/logger";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { GstBusinessFormData } from "../components/GstBusinessStep/GstBusinessStep";

export interface UseGstLookupsProps {
  data: GstBusinessFormData;
  onChange: (fields: Partial<GstBusinessFormData>) => void;
}

export const useGstFieldLookups = ({ data, onChange }: UseGstLookupsProps) => {
  const [pinLoading, setPinLoading] = useState(false);

  const latestPinRef = useRef<string>("");
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const handlePinLookup = useCallback(async (pin: string) => {
    const cleanPin = (pin || "").trim();
    latestPinRef.current = cleanPin;
    if (!pinCodeService.isValidFormat(cleanPin)) return;
    setPinLoading(true);
    try {
      const res = await pinCodeService.lookup(cleanPin);
      if (latestPinRef.current !== cleanPin) return;
      const current = dataRef.current;
      const resolvedCity = current.city || res.city;
      const resolvedDistrict = current.district || res.district;
      if (resolvedCity && !GstValidators.isValidCity(resolvedCity)) {
        logger.warn("[useGstFieldLookups] PIN lookup city conflicts with alphabetic-only rule:", {
          city: resolvedCity,
          pin: cleanPin,
        });
      }
      if (resolvedDistrict && !GstValidators.isValidDistrict(resolvedDistrict)) {
        logger.warn("[useGstFieldLookups] PIN lookup district conflicts with alphabetic-only rule:", {
          district: resolvedDistrict,
          pin: cleanPin,
        });
      }
      onChange({
        pinCode: cleanPin,
        city: resolvedCity,
        district: resolvedDistrict,
        state: current.state || res.state,
      });
    } catch (e) {
      logger.debug("[useGstFieldLookups] PIN lookup skipped or not found:", { error: e });
    } finally {
      if (latestPinRef.current === cleanPin) {
        setPinLoading(false);
      }
    }
  }, [onChange]);

  return {
    pinLoading,
    ifscLoading: false,
    ifscError: null,
    getIfscError: () => null,
    handlePinLookup,
  };
};
