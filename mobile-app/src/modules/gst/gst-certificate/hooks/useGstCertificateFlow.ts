import { useState, useRef, useEffect, useCallback } from "react";
import { Alert, Animated, Platform, BackHandler } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getActiveCustomerMobile } from "@/store/applicationStorage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { useAuthStore } from "@/store/authStore";
import { useApplicationStore } from "@/store/applicationStore";
import { useGstStore } from "@/modules/gst/store/gstStore";
import { notificationService } from "@/modules/notifications/services/notificationService";
import { useUniversalDraftGuard } from "@/shared/hooks/useUniversalDraftGuard";
import { validateGstinFull, validateGstinLive } from "@/modules/gst/utils/gstValidation";

import { CertificateRequestParams } from "../types/gstCertificateTypes";
import { buildCertificateHtml } from "../utils/gstCertificateHtml";
import { mapRegistrationDataToCertificate } from "../utils/gstCertificateMapper";
import { getErrorMessage } from "@/core/error-handling/errorMessage";
import { logger } from "@/core/logging/logger";

export function useGstCertificateFlow() {
  const router = useRouter();
  const rawParams = useLocalSearchParams();
  const params: CertificateRequestParams = {
    gstin: typeof rawParams.gstin === "string" ? rawParams.gstin : undefined,
    legalName: typeof rawParams.legalName === "string" ? rawParams.legalName : undefined,
    tradeName: typeof rawParams.tradeName === "string" ? rawParams.tradeName : undefined,
    constitution: typeof rawParams.constitution === "string" ? rawParams.constitution : undefined,
    address: typeof rawParams.address === "string" ? rawParams.address : undefined,
    signatoryName: typeof rawParams.signatoryName === "string" ? rawParams.signatoryName : undefined,
    director: typeof rawParams.director === "string" ? rawParams.director : undefined,
    state: typeof rawParams.state === "string" ? rawParams.state : undefined,
  };

  const customer = useAuthStore((s) => s.customer);
  const applications = useApplicationStore((s) => s.applications);
  const saveGstCertificateDraft = useApplicationStore((s) => s.saveGstCertificateDraft);
  const clearGstCertificateDraft = useApplicationStore((s) => s.clearGstCertificateDraft);
  const gstCertificateDraft = useApplicationStore((s) => s.gstCertificateDraft);
  const createApplication = useApplicationStore((s) => s.createApplication);
  const gstDraft = useApplicationStore((s) => s.gstDraft);
  const registrationDraft = useGstStore((s) => s.registrationDraft);

  const registeredMobile = customer?.mobile ? `+91 ${customer.mobile}` : "+91 9347074726";
  const registeredEmail = customer?.email || "user@finsolz.in";

  const [gstin, setGstin] = useState(params.gstin || "");
  const [requestType, setRequestType] = useState("Download Existing Certificate (Form REG-06)");
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [error, setError] = useState("");
  const [gstinError, setGstinError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [certificatePdfUri, setCertificatePdfUri] = useState<string | null>(null);
  const [generatedFileName, setGeneratedFileName] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  const floatAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gstCertificateDraft?.formData) {
      if (gstCertificateDraft.formData.gstin && !gstin) {
        setGstin(String(gstCertificateDraft.formData.gstin));
      }
      if (gstCertificateDraft.formData.requestType) {
        setRequestType(String(gstCertificateDraft.formData.requestType));
      }
    } else {
      void (async () => {
        const clean = getActiveCustomerMobile();
        try {
          const raw = await AsyncStorage.getItem(`@finsolz_draft_${clean}_gst-certificate`);
          if (!raw) return;
          const parsed = JSON.parse(raw) as { formData?: Record<string, unknown> };
          if (parsed.formData?.gstin && !gstin) {
            setGstin(String(parsed.formData.gstin));
          }
          if (parsed.formData?.requestType) {
            setRequestType(String(parsed.formData.requestType));
          }
        } catch {}
      })();
    }
  }, [gstCertificateDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isCompleted) return;
    const backAction = () => {
      router.replace("/(main)/applications");
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isCompleted, router]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim, floatAnim, isCompleted]);

  const draftGuard = useUniversalDraftGuard({
    isDirty: () => Boolean(gstin),
    onSaveDraft: () => {
      saveGstCertificateDraft({
        formData: { gstin, requestType },
        step: 0,
        updatedAt: new Date().toISOString().split("T")[0],
      });
    },
    onDiscardDraft: () => {
      clearGstCertificateDraft();
    },
    isSubmitted: () => isCompleted,
  });

  const handleGstinChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setGstin(cleaned);
    setGstinError(validateGstinLive(cleaned) ?? "");
  }, []);

  const handleGstinBlur = useCallback(() => {
    setIsFocused(false);
    const err = validateGstinFull(gstin);
    setGstinError(err ?? "");
  }, [gstin]);

  const downloadAndSharePdf = useCallback(async (uri: string, fileName: string) => {
    try {
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = uri;
        link.download = fileName;
        link.click();
        return;
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: fileName,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("Certificate Ready", `PDF generated successfully as ${fileName}`);
      }
    } catch (err) {
      if (getErrorMessage(err)?.includes?.("cancel") || getErrorMessage(err)?.includes?.("dismiss")) return;
      Alert.alert("Certificate Ready", `Your certificate PDF (${fileName}) is ready.`);
    }
  }, []);

  const handleGenerateCertificate = useCallback(async () => {
    const gstinValidationError = validateGstinFull(gstin);
    if (gstinValidationError) {
      setGstinError(gstinValidationError);
      Alert.alert("Invalid GSTIN", "Please enter a valid 15-character GSTIN to download certificate.");
      return;
    }
    if (!requestType) {
      setError("Please select a request type.");
      return;
    }

    setIsProcessing(true);
    try {
      const regData = mapRegistrationDataToCertificate(
        gstin,
        params,
        applications,
        gstDraft,
        registrationDraft,
        customer
      );

      const cleanGstin = regData.gstin.replace(/[^a-zA-Z0-9]/g, "");
      const fileName = cleanGstin ? `GST-Certificate-${cleanGstin}.pdf` : "GST-Certificate.pdf";
      const html = buildCertificateHtml(regData);

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      setCertificatePdfUri(uri);
      setGeneratedFileName(fileName);
      draftGuard.markSubmitted();
      setIsCompleted(true);

      try {
        createApplication(
          "gst-certificate",
          "GST Certificate (REG-06)",
          "GST",
          {
            gstin: regData.gstin,
            legalName: regData.legalName,
            tradeName: regData.tradeName,
            constitution: regData.constitution,
            requestType,
            pdfUri: uri,
            fileName,
            downloadDate: new Date().toISOString(),
          },
          [],
          0
        );

        notificationService.notify(
          "GST Certificate Ready",
          `Form GST REG-06 for ${regData.gstin} is ready.`,
          "gst"
        );
      } catch (appErr) {
        logger.warn("[useGstCertificateFlow] ApplicationStore sync failed:", { error: appErr });
      }

      await downloadAndSharePdf(uri, fileName);
    } catch (err) {
      logger.error("[useGstCertificateFlow] Certificate generation failed:", { error: err });
      Alert.alert("Generation Failed", "Could not generate certificate. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [applications, customer, downloadAndSharePdf, draftGuard, gstDraft, gstin, params, registrationDraft, requestType]);

  return {
    router,
    gstin,
    setGstin,
    requestType,
    setRequestType,
    showTypeModal,
    setShowTypeModal,
    error,
    setError,
    gstinError,
    setGstinError,
    isProcessing,
    isCompleted,
    certificatePdfUri,
    generatedFileName,
    isFocused,
    setIsFocused,
    floatAnim,
    btnScale,
    fadeAnim,
    registeredMobile,
    registeredEmail,
    draftGuard,
    handleGstinChange,
    handleGstinBlur,
    downloadAndSharePdf,
    handleGenerateCertificate,
  };
}
