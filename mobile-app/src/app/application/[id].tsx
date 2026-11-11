import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Alert,
} from "react-native";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useApplicationStore } from "@/store/applicationStore";
import { applicationService } from "@/modules/applications/services/applicationService";
import { logger } from "@/core/logging/logger";
import type { Application, TimelineStep } from "@/types/domain";
import { styles } from "@/styles/app/application/[id].styles";

import {
  ApplicationHeader,
  type DetailTab,
} from "@/components/screens/application/ApplicationHeader";
import { OverviewTab } from "@/components/screens/application/OverviewTab";
import { StatusTab } from "@/components/screens/application/StatusTab";
import { DocumentsTab } from "@/components/screens/application/DocumentsTab";
import { PaymentsTab } from "@/components/screens/application/PaymentsTab";
import { ChatTab } from "@/components/screens/application/ChatTab";
import { useApplicationChat } from "@/modules/communication/hooks/useApplicationChat";
import {
  formatDisplayDate,
  getServiceSpecificTimeline,
} from "@/components/screens/application/applicationDetailsUtils";
import { formatAmendmentSubmissionDate } from "@/modules/gst/gst-amendment/utils/gstAmendmentHelpers";

export default function ApplicationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();

  const applications = useApplicationStore((state) => state.applications);

  const [remoteApp, setRemoteApp] = useState<Application | null>(null);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState<DetailTab>(tab === "CHAT" ? "CHAT" : "OVERVIEW");

  const cleanId = id ? String(id).trim() : "";

  const app =
    (cleanId
      ? applications.find(
        (a) =>
          a.id === cleanId ||
          (a.formData?.arn && String(a.formData.arn).trim() === cleanId) ||
          (a.formData?.gstId && String(a.formData.gstId).trim() === cleanId) ||
          (a.formData?.applicationId && String(a.formData.applicationId).trim() === cleanId)
      )
      : null) ||
    (remoteApp &&
      (remoteApp.id === cleanId ||
        String(remoteApp.formData?.applicationId || "").trim() === cleanId ||
        String(remoteApp.formData?.arn || "").trim() === cleanId)
      ? remoteApp
      : null);

  const handleBack = React.useCallback(() => {
    router.replace("/(main)/home" as any);
  }, [router]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });
    return () => sub.remove();
  }, [handleBack]);

  // The Chat tab talks to the manager who took the application, through the backend chat.
  const chat = useApplicationChat(app, activeTab === "CHAT");

  const handleSendMessage = async (
    attachment?: { uri: string; fileName: string; fileSize?: number; mimeType: string } | null,
  ) => {
    const text = chatInput.trim();
    if (!text && !attachment) return;
    if (!app) return;
    if (attachment) {
      Alert.alert("Attachments not available", "Photos can't be sent in this chat yet. Send your message as text.");
      return;
    }
    try {
      await chat.send(text);
      setChatInput("");
    } catch (err) {
      logger.warn("[ApplicationDetails] Failed to send chat message", { error: err });
      throw err;
    }
  };

  useEffect(() => {
    let isCancelled = false;
    if (!app && id) {
      const loadRemote = async () => {
        try {
          const fetched = await applicationService.getApplicationById(id);
          if (!isCancelled && fetched) setRemoteApp(fetched);
        } finally {
          if (!isCancelled) setIsLoadingRemote(false);
        }
      };
      loadRemote();
    }
    return () => {
      isCancelled = true;
    };
  }, [id, app]);

  if (isLoadingRemote) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingWrap,
          { paddingTop: insets.top + 20 },
        ]}
      >
        <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />
        <ActivityIndicator size="large" color="#FF5722" />
        <Text style={styles.loadingText}>Loading application details...</Text>
      </View>
    );
  }

  if (!app) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: "#0A2346", paddingTop: insets.top + 20 },
        ]}
      >
        <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Not Found</Text>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.errorContent}>
          <Ionicons name="warning-outline" size={48} color="#EA580C" />
          <Text style={styles.errorText}>Application not found.</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.actionBtnFilled}
          >
            <Text style={styles.actionBtnFilledText}>
              Return to Applications
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Derived Application Metadata ──────────────────────────────────────────

  const isGstAmendment = app.serviceId === "gst-amendment";
  const formData = (app.formData || {}) as Record<string, any>;
  const isLoans =
    app.category === "LOANS" ||
    (app.serviceId || "").startsWith("loan") ||
    app.serviceId === "machinery-loan";

  const displayId =
    (isGstAmendment && formData.arn ? String(formData.arn) : null) ||
    formData.applicationId ||
    app.id;

  const filingPeriod =
    formData.filingPeriod ||
    formData.returnPeriod ||
    formData.period ||
    formData.periodData?.filingPeriod ||
    formData.filingMonth;

  const displayName =
    (isGstAmendment && formData.section
      ? `GST Amendment — ${formData.section}`
      : filingPeriod &&
        (app.serviceId?.includes("filing") || app.serviceName?.toLowerCase().includes("filing")) &&
        !app.serviceName?.includes(filingPeriod)
        ? `${app.serviceName} (${filingPeriod})`
        : app.serviceName) || "Application";

  let timeStr = formData.submissionTime || formData.time || "";
  if (!timeStr && app?.createdAt) {
    const cd = new Date(app.createdAt);
    if (!isNaN(cd.getTime())) {
      timeStr = cd.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const baseAppliedDate =
    (formData.submissionDate ? formatAmendmentSubmissionDate(formData.submissionDate) : null) ||
    formData.appliedDate ||
    formatDisplayDate(app.createdAt, timeStr);

  const appliedDate =
    timeStr && !baseAppliedDate.includes(timeStr)
      ? `${baseAppliedDate}, ${timeStr}`
      : baseAppliedDate;


  const assignedCA =
    app.assignedExecutive && app.assignedExecutive.trim() !== ""
      ? app.assignedExecutive.trim()
      : isLoans
        ? "Loan Processing Officer"
        : "CA not assigned yet";


  const timelineSteps: TimelineStep[] =
    app.timeline && app.timeline.length > 0
      ? app.timeline
      : getServiceSpecificTimeline(app, appliedDate);

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#0A2346" />

      {/* Header and horizontal tabs (Screens 2–6 Reference) */}
      <ApplicationHeader
        topInset={insets.top}
        serviceName={displayName}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={handleBack}
        onSettings={() => router.push("/profile" as any)}
      />

      {/* Main Tab Content */}
      {activeTab === "CHAT" ? (
        <ChatTab
          app={app}
          chatHistory={chat.messages}
          assignedCA={chat.manager?.name ?? assignedCA}
          isLoans={isLoans}
          appliedDate={appliedDate}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isSendingChat={chat.sending}
          managerName={chat.manager?.name ?? null}
          chatStatus={chat.loading && !chat.manager ? "loading" : chat.error ? "error" : !chat.manager ? "no-manager" : "ready"}
          chatError={chat.error}
          onSendMessage={handleSendMessage}
          formatDisplayDate={formatDisplayDate}
          bottomInset={insets.bottom}
          onViewApplication={() => setActiveTab("OVERVIEW")}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === "OVERVIEW" && (
            <OverviewTab
              app={app}
              displayId={displayId}
              appliedDate={appliedDate}
              onChatWithCA={() => setActiveTab("CHAT")}
            />
          )}

          {activeTab === "STATUS" && (
            <StatusTab
              app={app}
              timelineSteps={timelineSteps}
              currentStatus={app.status || "Submitted"}
              appliedDate={appliedDate}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "DOCUMENTS" && (
            <DocumentsTab
              app={app}
              isGstAmendment={isGstAmendment}
              formData={formData}
              documents={app.documents}
              appliedDate={appliedDate}
            />
          )}

          {activeTab === "PAYMENTS" && (
            <PaymentsTab
              app={app}
              isGstAmendment={isGstAmendment}
              appliedDate={appliedDate}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}
