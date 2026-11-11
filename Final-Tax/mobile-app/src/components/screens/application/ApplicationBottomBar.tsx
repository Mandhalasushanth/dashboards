import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { styles } from "@/styles/app/application/[id].styles";
import type { DetailTab } from "./ApplicationHeader";

interface ApplicationBottomBarProps {
  activeTab: DetailTab;
  bottomInset: number;
  assignedCA: string;
  chatInput: string;
  setChatInput: (text: string) => void;
  isSendingChat: boolean;
  onSendMessage: () => void;
  isLoans: boolean;
  onOpenChat: () => void;
}

export function ApplicationBottomBar({
  activeTab,
  bottomInset,
  assignedCA,
  chatInput,
  setChatInput,
  isSendingChat,
  onSendMessage,
  isLoans,
  onOpenChat,
}: ApplicationBottomBarProps) {
  const isChatActive = activeTab === "CHAT";
  const canSend = Boolean(chatInput.trim()) && !isSendingChat;

  if (isChatActive) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? bottomInset + 20 : 0}
      >
        <View
          style={[
            (styles as any).chatInputBar || styles.chatInputRow,
            { paddingBottom: Math.max(bottomInset, 12) },
          ]}
        >
          <TextInput
            style={styles.chatTextInput}
            placeholder={`Message ${assignedCA}...`}
            placeholderTextColor="#94A3B8"
            value={chatInput}
            onChangeText={setChatInput}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSendMessage}
            disabled={!canSend}
            style={[styles.chatSendBtn, { opacity: !canSend ? 0.5 : 1 }]}
          >
            {isSendingChat ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View
      style={[
        (styles as any).bottomActionBar || styles.chatInputRow,
        { paddingBottom: Math.max(bottomInset, 12) },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onOpenChat}
        style={styles.actionBtnFilled}
      >
        <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
        <Text style={styles.actionBtnFilledText}>
          {isLoans ? "Chat with Loan Agent" : "Chat with CA"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
