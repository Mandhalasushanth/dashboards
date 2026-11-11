import type { ComponentProps } from "react";
import type Ionicons from "@expo/vector-icons/Ionicons";
import type { ProfileModalType } from "@/components/screens/profile/ProfileSectionModal";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type RowAction =
  | { kind: "route"; href: any }
  | { kind: "modal"; modal: "personal" | "kyc" | ProfileModalType }
  | { kind: "soon" };

export interface MenuRow {
  label: string;
  icon: IconName;
  tint: string;
  tintBg: string;
  action: RowAction;
}

export interface MenuSection {
  title: string;
  rows: MenuRow[];
}

export const SECTIONS: MenuSection[] = [
  {
    title: "Account",
    rows: [
      {
        label: "Personal Information",
        icon: "person",
        tint: "#6D28D9",
        tintBg: "#F1ECFE",
        action: { kind: "modal", modal: "personal" },
      },
      {
        label: "KYC Details",
        icon: "card",
        tint: "#2563EB",
        tintBg: "#EAF1FE",
        action: { kind: "modal", modal: "kyc" },
      },
      {
        label: "GST Details",
        icon: "receipt",
        tint: "#7C3AED",
        tintBg: "#F1ECFE",
        action: { kind: "modal", modal: "gst" },
      },
      {
        label: "ITR History",
        icon: "reader",
        tint: "#EA580C",
        tintBg: "#FEF0E6",
        action: { kind: "modal", modal: "itr" },
      },
      {
        label: "Loan History",
        icon: "business",
        tint: "#475569",
        tintBg: "#EEF2F6",
        action: { kind: "modal", modal: "loans" },
      },
    ],
  },
  {
    title: "Services",
    rows: [
      {
        label: "My Applications",
        icon: "folder",
        tint: "#D97706",
        tintBg: "#FDF2E3",
        action: { kind: "route", href: "/(main)/applications" },
      },
      {
        label: "Payments & Invoices",
        icon: "card",
        tint: "#0891B2",
        tintBg: "#E5F5F9",
        action: { kind: "route", href: "/(main)/payments" },
      },
      {
        label: "Notifications",
        icon: "notifications",
        tint: "#EA580C",
        tintBg: "#FEF0E6",
        action: { kind: "route", href: "/notifications" },
      },
    ],
  },
  {
    title: "Preferences",
    rows: [
      {
        label: "Settings",
        icon: "settings-outline",
        tint: "#FF7A00",
        tintBg: "#FEF0E6",
        action: { kind: "route", href: "/settings" },
      },
    ],
  },
  {
    title: "Security",
    rows: [
      {
        label: "Change Password",
        icon: "lock-closed",
        tint: "#DC2626",
        tintBg: "#FDEBEB",
        action: { kind: "soon" },
      },
      {
        label: "Two-Factor Authentication",
        icon: "keypad",
        tint: "#6D28D9",
        tintBg: "#F1ECFE",
        action: { kind: "soon" },
      },
      {
        label: "Login History",
        icon: "time",
        tint: "#475569",
        tintBg: "#EEF2F6",
        action: { kind: "soon" },
      },
      {
        label: "Privacy Settings",
        icon: "shield-half",
        tint: "#D97706",
        tintBg: "#FDF2E3",
        action: { kind: "soon" },
      },
    ],
  },
  {
    title: "Support",
    rows: [
      {
        label: "Customer Support",
        icon: "chatbubbles",
        tint: "#2563EB",
        tintBg: "#EAF1FE",
        action: { kind: "route", href: "/chat/support" },
      },
      {
        label: "Rate Finsolz",
        icon: "star",
        tint: "#D97706",
        tintBg: "#FDF2E3",
        action: { kind: "soon" },
      },
      {
        label: "Terms & Conditions",
        icon: "document-text",
        tint: "#475569",
        tintBg: "#EEF2F6",
        action: { kind: "soon" },
      },
      {
        label: "Privacy Policy",
        icon: "shield-checkmark",
        tint: "#0891B2",
        tintBg: "#E5F5F9",
        action: { kind: "soon" },
      },
    ],
  },
];
