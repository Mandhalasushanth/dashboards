import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { Application } from "@/types/domain";
import { styles } from "@/styles/app/(main)/applications.styles";
import { ApplicationCardAvatar } from "./ApplicationIcons";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatDisplayDateTime(dateStr?: string, timeStr?: string): string {
  if (!dateStr || typeof dateStr !== "string") return "";
  const trimmed = dateStr.trim();
  if (!trimmed) return "";

  // If already formatted with time (e.g., "30 Oct 2026, 01:45 PM")
  if (/(?:AM|PM|\d{1,2}:\d{2})/i.test(trimmed) && MONTH_NAMES.some((m) => trimmed.includes(m))) {
    return trimmed;
  }

  const d = new Date(trimmed);
  if (!isNaN(d.getTime()) && (trimmed.includes("T") || trimmed.includes(":"))) {
    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const timeFormatted = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${day} ${month} ${year}, ${timeFormatted}`;
  }

  let formattedDate = trimmed;
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = match[1];
    const monthIdx = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const month = MONTH_NAMES[monthIdx];
    if (month) {
      formattedDate = `${day} ${month} ${year}`;
    }
  } else if (!isNaN(d.getTime())) {
    formattedDate = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  }

  const cleanTime = timeStr?.trim();
  if (cleanTime && !formattedDate.includes(cleanTime)) {
    return `${formattedDate}, ${cleanTime}`;
  }
  return formattedDate;
}

interface StatusBadgeConfig {
  matcher: (lower: string) => boolean;
  bg: string;
  text: string;
  label: string;
}

const STATUS_CONFIGS: StatusBadgeConfig[] = [
  {
    matcher: (s) =>
      s.includes("complete") ||
      s.includes("disbursed") ||
      s.includes("active") ||
      s.includes("approved") ||
      s.includes("sanctioned") ||
      s.includes("closed"),
    bg: "#DCFCE7",
    text: "#16A34A",
    label: "Completed",
  },
  {
    matcher: (s) => s.includes("submit"),
    bg: "#DCFCE7",
    text: "#16A34A",
    label: "Submitted",
  },
  {
    matcher: (s) =>
      s.includes("verification") || s.includes("review") || s.includes("scrutiny"),
    bg: "#E0F2FE",
    text: "#0284C7",
    label: "Under Verification",
  },
  {
    matcher: (s) => s.includes("progress") || s.includes("process"),
    bg: "#FFEDD5",
    text: "#EA580C",
    label: "In Progress",
  },
  {
    matcher: (s) => s.includes("reject") || s.includes("fail") || s.includes("cancel"),
    bg: "#FEE2E2",
    text: "#DC2626",
    label: "Rejected",
  },
];

export function getStatusBadgeStyle(status?: string) {
  if (!status || !status.trim()) {
    return {
      bg: "#DCFCE7",
      text: "#16A34A",
      label: "Submitted",
    };
  }
  const lower = status.trim().toLowerCase();
  const matched = STATUS_CONFIGS.find((cfg) => cfg.matcher(lower));
  return (
    matched ?? {
      bg: "#EFF6FF",
      text: "#083B75",
      label: status,
    }
  );
}

interface ApplicationCardItemProps {
  item: Application;
  isDark: boolean;
  textColor: string;
  borderColor: string;
  bgColor: string;
  onPress: (item: Application) => void;
}

function formatSectionTitle(raw?: string): string {
  if (!raw) return "";
  const map: Record<string, string> = {
    SIGNATORY: "Authorised Signatories",
    CONTACT: "Contact Details",
    BANK_ACCOUNT: "Bank Accounts",
    LEGAL_NAME: "Legal Business Name",
    PRINCIPAL_PLACE: "Principal Place of Business",
    ADDITIONAL_PLACE: "Additional Place of Business",
    RECONCILIATION_SUPPORT: "Reconciliation Support",
  };
  const key = raw.trim().toUpperCase();
  if (map[key]) return map[key];
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ApplicationCardItem({
  item,
  isDark,
  textColor,
  borderColor,
  bgColor,
  onPress,
}: ApplicationCardItemProps) {
  const badge = getStatusBadgeStyle(item.status);
  const isDraft = item.status === "Draft" || Boolean(item.formData?.isDraft);

  const formattedSection = formatSectionTitle(item.formData?.section);
  const formattedCompliance = formatSectionTitle(item.formData?.requestType);

  const displayName =
    item.serviceId === "gst-cancellation"
      ? "GST Cancellation (REG-16)"
      : item.serviceId === "gst-amendment" && formattedSection
        ? `GST Amendment — ${formattedSection}`
        : item.serviceId === "gst-compliance" && formattedCompliance
          ? `GST Compliance — ${formattedCompliance}`
          : item.serviceName || "Finsolz Service";

  const rawDate =
    item.formData?.submissionDate ||
    item.formData?.appliedDate ||
    item.formData?.updatedAt ||
    item.createdAt ||
    "";
  let rawTime =
    item.formData?.submissionTime ||
    item.formData?.time ||
    "";

  if (!rawTime && item.createdAt) {
    const cd = new Date(item.createdAt);
    if (!isNaN(cd.getTime())) {
      rawTime = cd.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const formattedDateTime = formatDisplayDateTime(rawDate, rawTime);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(item)}
      style={[
        styles.appCard,
        {
          backgroundColor: bgColor,
          borderColor,
        },
      ]}
    >
      <ApplicationCardAvatar
        category={item.category}
        serviceId={item.serviceId}
        serviceName={item.serviceName}
      />

      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardTitleWrap}>
            <Text style={[styles.serviceNameText, { color: textColor }]}>
              {displayName}
            </Text>
          </View>
          <View style={styles.cardBadgeWrap}>
            {isDraft ? (
              <View style={styles.resumeBadge}>
                <Text style={styles.resumeBadgeText}>Draft</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                  {badge.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardFooterRow}>
          <Text style={[styles.appliedDateText, isDark && styles.appliedDateTextDark]}>
            {formattedDateTime || "In Progress"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#94A3B8"
            style={styles.cardChevron}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
