import React, { useRef, useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  FlatList, ScrollView, KeyboardAvoidingView, Platform, Image, Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import {
  chatStyles, getComposerInsetStyle, getProgressFillStyle,
  getBadgeBgStyle, getBadgeTextColorStyle,
} from "./ChatTab.styles";
import { ChatImageBubble } from "./ChatImageBubble";
import { GstViewDocumentModal } from "@/modules/gst/components/GstDocumentCard/GstViewDocumentModal";
import { getStatusBadgeStyle } from "@/components/screens/applications/ApplicationCardItem";
import { useApplicationStore } from "@/store/applicationStore";
import { logger } from "@/core/logging/logger";
import {
  validatePickedImage, sanitizeMessageText, formatFileSize,
  getDynamicDateDivider, type SelectedImageAttachment,
} from "@/modules/applications/utils/chatAttachmentUtils";
import type { ChatMessage, Application } from "@/types/domain";

export { getDynamicDateDivider };

interface ChatTabProps {
  app?: Application;
  chatHistory?: ChatMessage[];
  assignedCA?: string;
  isLoans?: boolean;
  appliedDate?: string;
  chatInput: string;
  setChatInput: (text: string) => void;
  isSendingChat: boolean;
  onSendMessage: (attachment?: SelectedImageAttachment | null) => Promise<void> | void;
  formatDisplayDate: (dateStr?: string) => string;
  bottomInset?: number;
  onViewApplication?: () => void;
  /** The manager who took the application, once there is one; named in the empty state and the input hint. */
  managerName?: string | null;
  /**
   * Where the backend chat stands: "ready" (default) lets the customer write; "loading" and "no-manager" show a
   * note and keep the composer off; "error" shows `chatError` above the composer.
   */
  chatStatus?: "ready" | "loading" | "no-manager" | "error";
  chatError?: string | null;
}

export function ChatTab({
  app: propApp,
  chatHistory = [],
  assignedCA,
  isLoans,
  chatInput,
  setChatInput,
  isSendingChat,
  onSendMessage,
  formatDisplayDate,
  bottomInset = 0,
  onViewApplication,
  managerName,
  chatStatus = "ready",
  chatError,
}: ChatTabProps) {
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImageAttachment | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | undefined>(undefined);
  const [previewFileName, setPreviewFileName] = useState<string | undefined>(undefined);

  const chatOpen = chatStatus === "ready" || chatStatus === "error";
  const canSend = chatOpen && (Boolean(chatInput.trim()) || Boolean(selectedImage)) && !isSendingChat;
  const caInitials = isLoans ? "LO" : "CA";
  const roleName = isLoans ? "Loan Officer" : "CA Manager";
  const who = managerName?.trim() || `your ${roleName}`;
  const emptyTitle = managerName?.trim() ? `Chat with ${managerName.trim()}` : isLoans ? "Chat with your Loan Officer" : "Chat with your CA Manager";
  const placeholderText = chatOpen ? `Ask ${who} anything...` : "Chat opens when a manager takes your application";
  const emptyText =
    chatStatus === "loading"
      ? "Loading your conversation..."
      : chatStatus === "no-manager"
        ? "A manager hasn't taken your application yet. You can chat here as soon as one does."
        : `Have questions or need updates about your application? Send a message below to connect directly with ${who}.`;

  const storeApp = useApplicationStore((s) => {
    if (propApp) return propApp;
    return s.applications.find((a) => a.id === s.selectedApplicationId) || null;
  });
  const currentApp = propApp || storeApp;

  const badge = getStatusBadgeStyle(currentApp?.status);
  const serviceTitle = currentApp?.serviceName || "Application Support";
  const statusMessage =
    currentApp?.status === "Completed"
      ? "Your application has been completed successfully."
      : currentApp?.status === "In Progress"
        ? "Your CA team is actively working on your application."
        : "Your CA team is reviewing your application.";
  const progressPercent =
    typeof currentApp?.progress === "number" && currentApp.progress > 0
      ? Math.min(100, Math.max(10, currentApp.progress))
      : 35;

  const hasMessages = Array.isArray(chatHistory) && chatHistory.length > 0;

  const scrollToBottom = () => {
    if (hasMessages) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    if (hasMessages) {
      const timer = setTimeout(scrollToBottom, 120);
      return () => clearTimeout(timer);
    }
  }, [chatHistory.length, hasMessages]);

  const handleAttachment = async () => {
    if (isSendingChat) return;
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Required", "Please allow photo gallery access to attach images to your chat.");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.85,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const asset = res.assets[0];
      const validation = validatePickedImage({ fileSize: asset.fileSize, mimeType: asset.mimeType });
      if (!validation.valid) {
        Alert.alert("Invalid Image", validation.error || "Please select a valid image.");
        return;
      }

      setSelectedImage({
        uri: asset.uri,
        fileName: asset.fileName || `attachment_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
        mimeType: asset.mimeType || "image/jpeg",
      });
    } catch (err) {
      logger.warn("[ChatTab] Image picker error", { error: err });
      Alert.alert("Attachment Error", "Unable to open image gallery. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!canSend || isSendingChat) return;
    const attachmentToSend = selectedImage;
    try {
      await onSendMessage(attachmentToSend);
      setSelectedImage(null);
    } catch (err) {
      logger.warn("[ChatTab] Send message error", { error: err });
      Alert.alert("Failed to Send", "Unable to send your message. Please check your connection and try again.");
    }
  };

  const handleOpenPreview = (uri: string, name?: string) => {
    setPreviewUri(uri);
    setPreviewFileName(name);
    setPreviewModalVisible(true);
  };

  const renderChatMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === "user";
    const timeStr = formatDisplayDate(item.timestamp);
    const imageUri = item.imageUrl || item.attachmentUrl;
    const cleanText = sanitizeMessageText(item.text);

    return (
      <View style={isUser ? chatStyles.chatRowUser : chatStyles.chatRowCA}>
        {!isUser && (
          <View style={chatStyles.chatAvatarCA}>
            <Text style={chatStyles.chatAvatarTextCA}>{caInitials}</Text>
          </View>
        )}
        <View style={!isUser ? chatStyles.chatContentCA : undefined}>
          <Text style={isUser ? chatStyles.senderLabelUser : chatStyles.senderLabelCA}>
            {isUser ? "You" : assignedCA || roleName}
          </Text>
          <View style={isUser ? chatStyles.chatBubbleUser : chatStyles.chatBubbleCA}>
            {imageUri ? (
              <ChatImageBubble
                uri={imageUri}
                fileName={item.attachmentName}
                onPress={() => handleOpenPreview(imageUri, item.attachmentName)}
              />
            ) : null}
            {cleanText ? (
              <Text
                style={
                  imageUri
                    ? isUser
                      ? chatStyles.chatImageCaptionUser
                      : chatStyles.chatImageCaptionCA
                    : isUser
                      ? chatStyles.chatTextUser
                      : chatStyles.chatTextCA
                }
              >
                {cleanText}
              </Text>
            ) : null}
          </View>
          {isUser ? (
            <View style={chatStyles.userDeliveryRow}>
              <Text style={chatStyles.chatTimestampUser}>{timeStr}</Text>
              <Ionicons name="checkmark-done" size={13} color="#94A3B8" />
            </View>
          ) : (
            <Text style={chatStyles.chatTimestampCA}>{timeStr}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={chatStyles.chatScreenContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── Application Context Card (Professional CA Connect) ── */}
      <View style={chatStyles.contextCard}>
        <View style={chatStyles.contextCardTop}>
          <Text style={chatStyles.contextCardTitle} numberOfLines={1}>{serviceTitle}</Text>
          <View style={[chatStyles.contextCardBadge, getBadgeBgStyle(badge.bg)]}>
            <Text style={[chatStyles.contextCardBadgeText, getBadgeTextColorStyle(badge.text)]}>
              {badge.label}
            </Text>
          </View>
        </View>
        <Text style={chatStyles.contextCardSubtitle}>{statusMessage}</Text>
        <View style={chatStyles.contextProgressRow}>
          <View style={chatStyles.contextProgressBarWrap}>
            <View style={[chatStyles.contextProgressBarFill, getProgressFillStyle(progressPercent)]} />
          </View>
          {onViewApplication && (
            <TouchableOpacity onPress={onViewApplication} style={chatStyles.contextCardAction} activeOpacity={0.7}>
              <Text style={chatStyles.contextCardActionText}>View application</Text>
              <Ionicons name="arrow-forward" size={13} color="#0A2346" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Date Divider ── */}
      <View style={chatStyles.dateDividerWrap}>
        <Text style={chatStyles.dateDividerText}>{getDynamicDateDivider()}</Text>
      </View>

      {/* ── Conversation Thread ── */}
      {hasMessages ? (
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderChatMessage}
          contentContainerStyle={chatStyles.chatMessagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToBottom}
        />
      ) : (
        <ScrollView
          contentContainerStyle={chatStyles.chatEmptyContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={chatStyles.chatEmptyIconCircle}>
            <Ionicons name="chatbubbles-outline" size={28} color="#0284C7" />
          </View>
          <Text style={chatStyles.chatEmptyTitle}>{emptyTitle}</Text>
          <Text style={chatStyles.chatEmptySubtitle}>{emptyText}</Text>
        </ScrollView>
      )}

      {/* ── Quick Question Chips ── */}
      <View style={chatStyles.quickQuestionsSection}>
        <View style={chatStyles.quickQuestionsHeader}>
          <Ionicons name="flash-outline" size={13} color="#EA580C" />
          <Text style={chatStyles.quickQuestionsTitle}>Quick questions</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={chatStyles.quickChipsScroll}>
          <TouchableOpacity
            style={chatStyles.quickChip}
            activeOpacity={0.7}
            onPress={() => setChatInput("What is the current status of my application?")}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={12} color="#EA580C" />
            <Text style={chatStyles.quickChipText}>Application status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={chatStyles.quickChip}
            activeOpacity={0.7}
            onPress={() => setChatInput("What documents are required for my application?")}
          >
            <Ionicons name="document-text-outline" size={12} color="#EA580C" />
            <Text style={chatStyles.quickChipText}>Required documents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={chatStyles.quickChip}
            activeOpacity={0.7}
            onPress={() => setChatInput("I have a question regarding my application payment.")}
          >
            <Ionicons name="card-outline" size={12} color="#EA580C" />
            <Text style={chatStyles.quickChipText}>Payment query</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Fixed Message Composer ── */}
      <View style={[chatStyles.chatComposerWrap, getComposerInsetStyle(bottomInset)]}>
        {/* ── Thumbnail Preview (Before Sending) ── */}
        {selectedImage && (
          <View style={chatStyles.attachmentPreviewBar}>
            <View style={chatStyles.attachmentPreviewThumbWrap}>
              <Image source={{ uri: selectedImage.uri }} style={chatStyles.attachmentPreviewThumb} resizeMode="cover" />
            </View>
            <View style={chatStyles.attachmentPreviewInfo}>
              <Text style={chatStyles.attachmentPreviewName} numberOfLines={1}>{selectedImage.fileName}</Text>
              {selectedImage.fileSize ? (
                <Text style={chatStyles.attachmentPreviewMeta}>{formatFileSize(selectedImage.fileSize)}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={chatStyles.attachmentRemoveBtn}
              onPress={() => setSelectedImage(null)}
              accessibilityRole="button"
              accessibilityLabel="Remove image attachment"
            >
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        )}

        {chatStatus === "error" && chatError ? <Text style={chatStyles.chatSecurityNoteText}>{chatError}</Text> : null}

        <View style={chatStyles.chatInputRow}>
          <TouchableOpacity
            style={chatStyles.chatAttachBtn}
            activeOpacity={0.7}
            onPress={handleAttachment}
            disabled={isSendingChat}
          >
            <Ionicons name="attach-outline" size={20} color="#64748B" />
          </TouchableOpacity>

          <TextInput
            style={chatStyles.chatTextInput}
            placeholder={placeholderText}
            placeholderTextColor="#94A3B8"
            value={chatInput}
            onChangeText={setChatInput}
            multiline
            maxLength={1000}
            editable={chatOpen && !isSendingChat}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSend}
            disabled={!canSend}
            style={[chatStyles.chatSendBtn, !canSend && chatStyles.chatSendBtnDisabled]}
          >
            {isSendingChat ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={15} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        {/* ── Subtle Security Note ── */}
        <View style={chatStyles.chatSecurityNote}>
          <Ionicons name="shield-checkmark-outline" size={12} color="#94A3B8" />
          <Text style={chatStyles.chatSecurityNoteText}>Secure professional support</Text>
        </View>
      </View>

      {/* ── Document / Image Preview Modal ── */}
      <GstViewDocumentModal
        visible={previewModalVisible}
        title="Attachment Preview"
        fileUri={previewUri}
        fileName={previewFileName}
        onClose={() => setPreviewModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}
