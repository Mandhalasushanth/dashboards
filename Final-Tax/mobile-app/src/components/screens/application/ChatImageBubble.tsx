import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { chatStyles } from "./ChatTab.styles";

interface ChatImageBubbleProps {
  uri: string;
  fileName?: string;
  onPress: () => void;
}

export function ChatImageBubble({ uri, fileName, onPress }: ChatImageBubbleProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <View style={chatStyles.chatImageFallback}>
        <Ionicons name="image-outline" size={24} color="#94A3B8" />
        <Text style={chatStyles.chatImageFallbackText}>
          {fileName || "Image attachment"}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={chatStyles.chatImageWrap}
      accessibilityRole="imagebutton"
      accessibilityLabel={fileName || "View attached image"}
    >
      <Image
        source={{ uri }}
        style={chatStyles.chatImage}
        resizeMode="cover"
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {loading ? (
        <View style={chatStyles.chatImageLoader}>
          <ActivityIndicator size="small" color="#0A2346" />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
