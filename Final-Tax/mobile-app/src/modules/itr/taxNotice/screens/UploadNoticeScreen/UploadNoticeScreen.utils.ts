import { TaxNoticeFormData } from "../../types/taxNotice.types";

export const validateStep1Data = (
  formData: TaxNoticeFormData,
  setErrors: (errors: Record<string, string>) => void
): boolean => {
  const newErrors: Record<string, string> = {};

  const panTrimmed = (formData.pan || "").trim().toUpperCase();
  if (!panTrimmed) {
    newErrors.pan = "PAN is required.";
  } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panTrimmed)) {
    newErrors.pan = "Enter a valid 10-character PAN (e.g. ABCDE1234F).";
  }

  if (!formData.assessmentYear.trim()) {
    newErrors.assessmentYear = "Assessment year is required.";
  }

  if (!formData.noticeType.trim()) {
    newErrors.noticeType = "Please select the notice type.";
  }

  if (!formData.noticeDate.trim()) {
    newErrors.noticeDate = "Notice date is required.";
  }

  if (!formData.noticeNumber.trim()) {
    newErrors.noticeNumber = "Notice reference number / DIN is required.";
  }

  if (!formData.responseDueDate.trim()) {
    newErrors.responseDueDate = "Response due date is required.";
  }

  if (!formData.customerExplanation.trim()) {
    newErrors.customerExplanation = "Please provide a brief explanation of your case.";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

export const validateStep2Data = (
  formData: TaxNoticeFormData,
  setErrors: (errors: Record<string, string>) => void
): boolean => {
  const newErrors: Record<string, string> = {};
  if (!formData.noticeFileName) {
    newErrors.file = "Please upload your Income Tax notice document.";
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
