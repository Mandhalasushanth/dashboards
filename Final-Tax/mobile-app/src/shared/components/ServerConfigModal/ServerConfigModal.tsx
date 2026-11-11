import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { apiClient } from "@/core/api/apiClient";
import { BrandColors } from "@/shared/theme";
import {
  styles,
  getResultBadgeStyle,
  getResultTextStyle,
} from "./ServerConfigModal.styles";

export interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (newUrl: string) => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const [url, setUrl] = useState(apiClient.getBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (visible) {
      setUrl(apiClient.getBaseUrl());
      setTestResult(null);
    }
  }, [visible]);

  const handleTest = async () => {
    let target = url.trim();
    if (target.includes(":8081")) {
      target = target.replace(":8081", ":8086");
      setUrl(target);
    }
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      if (/^(\d{1,3}\.){3}\d{1,3}/.test(target) || target.startsWith("localhost")) {
        target = `http://${target}`;
      } else {
        target = `https://${target}`;
      }
    }
    if (target.endsWith("/")) {
      target = target.slice(0, -1);
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${target}/actuator/health`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok || res.status === 200 || res.status === 401 || res.status === 403) {
        setTestResult({ success: true, message: "Backend is reachable!" });
      } else {
        setTestResult({ success: false, message: `Server returned status ${res.status}` });
      }
    } catch (_err) {
      setTestResult({
        success: false,
        message: "Cannot reach server. Verify IP and Wi-Fi connection.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    let clean = url.trim();
    if (clean.includes(":8081")) {
      clean = clean.replace(":8081", ":8086");
      setUrl(clean);
    }
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      if (/^(\d{1,3}\.){3}\d{1,3}/.test(clean) || clean.startsWith("localhost")) {
        clean = `http://${clean}`;
      } else {
        clean = `https://${clean}`;
      }
      setUrl(clean);
    }
    if (!clean) {
      Alert.alert("Invalid URL", "Please enter a valid IP address or server URL.");
      return;
    }
    const saved = await apiClient.saveCustomBaseUrl(clean);
    Alert.alert("Server Configured", `Backend URL updated to:\n${saved}`);
    onSaved?.(saved);
    onClose();
  };

  const handleReset = async () => {
    const def = await apiClient.resetCustomBaseUrl();
    setUrl(def);
    setTestResult(null);
    Alert.alert("Reset Complete", `Restored default backend URL:\n${def}`);
    onSaved?.(def);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Ionicons name="server-outline" size={24} color={BrandColors.PRIMARY_BLUE} />
            <Text style={styles.title}>Backend Server IP</Text>
          </View>

          <Text style={styles.description}>
            Configure the backend IP or tunnel URL (e.g. Wi-Fi IP or ngrok) for this device:
          </Text>

          <TextInput
            style={styles.input}
            value={url}
            onChangeText={(txt) => {
              setUrl(txt);
              setTestResult(null);
            }}
            placeholder="https://your-api-domain.example.com"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {url.includes(":8081") && (
            <TouchableOpacity
              style={{ backgroundColor: "#FFF2EA", borderColor: "#FED7AA", borderWidth: 1, padding: 8, borderRadius: 8, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 6 }}
              onPress={() => {
                setUrl(url.replace(":8081", ":8086"));
                setTestResult(null);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="warning-outline" size={16} color="#EA580C" />
              <Text style={{ fontSize: 12, color: "#EA580C", flex: 1, fontWeight: "600" }}>
                Port 8081 is Expo. Tap here to switch to Backend port 8086!
              </Text>
            </TouchableOpacity>
          )}

          {testResult && (
            <View style={[styles.resultBadge, getResultBadgeStyle(testResult.success)]}>
              <Ionicons
                name={testResult.success ? "checkmark-circle" : "close-circle"}
                size={16}
                color={testResult.success ? "#10B981" : "#EF4444"}
              />
              <Text style={[styles.resultText, getResultTextStyle(testResult.success)]}>
                {testResult.message}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTest}
            disabled={isTesting}
            activeOpacity={0.7}
          >
            {isTesting ? (
              <ActivityIndicator size="small" color={BrandColors.PRIMARY_BLUE} />
            ) : (
              <Text style={styles.testBtnText}>Test Connection</Text>
            )}
          </TouchableOpacity>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset Default</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save & Connect</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ServerConfigModal;
