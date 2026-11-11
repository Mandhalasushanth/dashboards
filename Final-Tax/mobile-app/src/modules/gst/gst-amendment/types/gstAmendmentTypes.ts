import { ImageSourcePropType } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export type AmendmentStep = "LANDING" | "EDIT" | "REVIEW" | "SUCCESS";

export interface AmendmentSectionConfig {
  id: string;
  title: string;
  type: "core" | "non-core";
  typeLabel: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: ImageSourcePropType;
  iconBg: string;
  iconColor: string;
}

export interface RegisteredDetails {
  legalBusinessName: string;
  principalAddress: string;
  principalCity: string;
  principalDistrict: string;
  principalState: string;
  principalPincode: string;
  principalProofType: string;
  additionalAddress: string;
  additionalCity: string;
  additionalPincode: string;
  additionalNatureOfPremises: string;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  accountType: string;
  signatoryName: string;
  signatoryPan: string;
  signatoryDesignation: string;
  signatoryMobile: string;
  signatoryEmail: string;
  contactMobile: string;
  contactEmail: string;
}

export interface SupportingDoc {
  uri: string;
  name: string;
  size: string;
}

export interface PickerModalState {
  isOpen: boolean;
  title: string;
  options: string[];
  selectedVal: string;
  onSelect: (val: string) => void;
}

export interface SubmissionResult {
  arn: string;
  date: string;
  appId: string;
  sectionTitle: string;
  isCore: boolean;
  gstin: string;
  estCompletion: string;
  businessName?: string;
}

export interface AmendmentFormData {
  newLegalBusinessName: string;
  newPrincipalAddress: string;
  newPrincipalCity: string;
  newPrincipalDistrict: string;
  newPrincipalState: string;
  newPrincipalPincode: string;
  newPrincipalNatureOfPremises: string;
  newAdditionalAddress: string;
  newAdditionalCity: string;
  newAdditionalPincode: string;
  newAdditionalNatureOfPremises: string;
  newBankName: string;
  newBankAccountNumber: string;
  confirmBankAccountNumber: string;
  newIfscCode: string;
  newAccountType: string;
  newSignatoryName: string;
  newSignatoryPan: string;
  newSignatoryDob: string;
  newSignatoryDesignation: string;
  newSignatoryMobile: string;
  newSignatoryEmail: string;
  newContactMobile: string;
  newContactEmail: string;
}

export const INITIAL_AMENDMENT_FORM_DATA: AmendmentFormData = {
  newLegalBusinessName: "",
  newPrincipalAddress: "",
  newPrincipalCity: "",
  newPrincipalDistrict: "",
  newPrincipalState: "",
  newPrincipalPincode: "",
  newPrincipalNatureOfPremises: "",
  newAdditionalAddress: "",
  newAdditionalCity: "",
  newAdditionalPincode: "",
  newAdditionalNatureOfPremises: "",
  newBankName: "",
  newBankAccountNumber: "",
  confirmBankAccountNumber: "",
  newIfscCode: "",
  newAccountType: "",
  newSignatoryName: "",
  newSignatoryPan: "",
  newSignatoryDob: "",
  newSignatoryDesignation: "",
  newSignatoryMobile: "",
  newSignatoryEmail: "",
  newContactMobile: "",
  newContactEmail: "",
};
