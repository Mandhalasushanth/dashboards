import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { styles } from "./ServerConfigHint.styles";

interface ServerConfigHintProps {
  error: string | null;
  /** Opens the server configuration modal. */
  onPress: () => void;
}

/** Shortcut to the server settings, shown only for connectivity-related errors. */
export function ServerConfigHint({ error, onPress }: ServerConfigHintProps) {
  return (
    <>
      {error && (
        error.toLowerCase().includes("server") ||
        error.toLowerCase().includes("connect") ||
        error.toLowerCase().includes("network") ||
        error.toLowerCase().includes("url") ||
        error.toLowerCase().includes("fetch")
      ) && (
          <TouchableOpacity
            onPress={onPress}
            style={styles.serverConfigBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.serverConfigBtnText}>
              ⚙️ Tap to change Server IP / URL
            </Text>
          </TouchableOpacity>
        )}
    </>
  );
}

export default ServerConfigHint;
