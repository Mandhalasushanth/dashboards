import React from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated } from "react-native";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { GstSelectModal, GstinInfoIcon } from "@/modules/gst/components/common";
import { UniversalDraftModal } from "@/shared/components/UniversalDraftModal";

import { useGstCertificateFlow } from "../../hooks/useGstCertificateFlow";
import {
  st,
  getTopBarStyle,
  getScaleTransformStyle,
  getOpacityAnimStyle,
} from "./GstCertificateScreen.styles";

const CERTIFICATE_REQUEST_TYPES = [
  "Download Existing Certificate (Form REG-06)",
  "Request Reprint / Duplicate Copy",
  "Certificate Verification & Status Check",
];

export function GstCertificateScreen() {
  const insets = useSafeAreaInsets();
  const flow = useGstCertificateFlow();

  const getButtonText = () =>
    flow.isProcessing ? "GENERATING CERTIFICATE..." : "DOWNLOAD CERTIFICATE (REG-06)";

  return (
    <View style={st.root}>
      <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={[st.topBar, getTopBarStyle(insets.top)]}>
        {!flow.isCompleted ? (
          <TouchableOpacity
            style={st.backBtn}
            activeOpacity={0.7}
            onPress={() => flow.router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
        ) : (
          <View style={st.backBtn} />
        )}
        <Text style={st.headerTitle}>GST Certificate (REG-06)</Text>
        <View style={st.taxEdgeBadge}>
          <Text style={st.taxText}>Tax</Text>
          <Text style={st.edgeText}>Edge</Text>
        </View>
      </View>

      {!flow.isCompleted ? (
        <KeyboardAwareScrollView
          contentContainerStyle={st.inputScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Banner */}
          <View style={st.heroContainer}>
            <View style={st.heroLeft}>
              <Text style={st.heroKicker}>OFFICIAL GOVERNMENT COPY</Text>
              <Text style={st.heroTitle}>Download GST Registration Certificate</Text>
              <Text style={st.heroSub}>
                Form GST REG-06 issued under Goods and Services Tax Act, 2017.
              </Text>
            </View>
            <View style={st.heroGraphicWrap}>
              <View style={st.heroGlowCircle} />
              <View style={st.heroDoc}>
                <View style={st.heroDocHeader} />
                <Text style={st.heroDocGst}>GST</Text>
                <View style={st.heroDocLine} />
                <View style={st.heroDocLineShort} />
              </View>
              <View style={st.heroDownloadCircle}>
                <Ionicons name="arrow-down" size={14} color="#FFFFFF" />
              </View>
            </View>
          </View>

          {/* GSTIN Input Card */}
          <View style={st.card}>
            <View style={st.cardHeaderRow}>
              <View style={st.cardIconBox}>
                <Ionicons name="barcode-outline" size={18} color="#1E5EFF" />
              </View>
              <View style={st.labelWithIcon}>
                <Text style={st.cardLabel}>
                  GSTIN Number <Text style={st.star}>*</Text>
                </Text>
                <GstinInfoIcon />
              </View>
            </View>
            <TextInput
              style={[
                st.input,
                flow.isFocused && st.inputFocused,
                Boolean(flow.gstinError) && st.inputError,
              ]}
              placeholder="Enter your GSTIN number"
              placeholderTextColor="#94A3B8"
              value={flow.gstin}
              onChangeText={flow.handleGstinChange}
              autoCapitalize="characters"
              maxLength={15}
              onFocus={() => flow.setIsFocused(true)}
              onBlur={flow.handleGstinBlur}
            />
            {Boolean(flow.gstinError) && <Text style={st.errorText}>{flow.gstinError}</Text>}
            <Text style={st.helperText}>Enter 15-character GSTIN for certificate download</Text>
          </View>

          {/* Purpose Selector */}
          <View style={st.card}>
            <View style={st.cardHeaderRow}>
              <View style={st.cardIconBox}>
                <Ionicons name="options-outline" size={18} color="#1E5EFF" />
              </View>
              <Text style={st.cardLabel}>
                Request Purpose <Text style={st.star}>*</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={st.dropdownBox}
              activeOpacity={0.8}
              onPress={() => flow.setShowTypeModal(true)}
            >
              <Text style={st.dropdownText}>{flow.requestType}</Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
            {Boolean(flow.error) && <Text style={st.errorText}>{flow.error}</Text>}
          </View>

          {/* Dispatch Channel */}
          <View style={st.card}>
            <View style={st.contactHeaderRow}>
              <View style={st.cardHeaderRow}>
                <View style={st.cardIconBox}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#1E5EFF" />
                </View>
                <Text style={st.cardLabel}>Verified Delivery Channel</Text>
              </View>
            </View>
            <Text style={st.contactPhone}>{flow.registeredMobile}</Text>
            <Text style={st.contactEmail}>{flow.registeredEmail}</Text>
            <Text style={st.contactSubText}>
              A notification will also be sent to your registered contact upon download.
            </Text>
          </View>

          {/* Download CTA Button */}
          <Animated.View style={getScaleTransformStyle(flow.btnScale)}>
            <TouchableOpacity
              style={[st.orangeCta, flow.isProcessing && st.orangeCtaDisabled]}
              activeOpacity={0.9}
              onPress={flow.handleGenerateCertificate}
              disabled={flow.isProcessing}
            >
              <Ionicons name="download-outline" size={20} color="#FFF" style={st.iconMarginRight8} />
              <Text style={st.orangeCtaText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAwareScrollView>
      ) : (
        /* Completed State */
        <ScrollView contentContainerStyle={st.readyScroll} showsVerticalScrollIndicator={false}>
          <View style={st.readyHeroWrap}>
            <View style={st.podiumBase} />
            <View style={st.podiumRing} />
            <View style={st.readyDocCard}>
              <Text style={st.docGstTag}>GST</Text>
              <View style={st.docLineWide} />
              <View style={st.docLineMed} />
              <View style={st.docLineWide} />
            </View>
            <View style={st.readyCheckBadge}>
              <Ionicons name="checkmark" size={22} color="#FFFFFF" />
            </View>
          </View>

          <Text style={st.readyTitle}>Certificate Ready!</Text>
          <Text style={st.readySub}>
            Your official <Text style={st.blueBold}>Form GST REG-06</Text> certificate has been generated successfully.
          </Text>

          <View style={st.detailsCard}>
            <View style={st.detailRow}>
              <View style={st.detailIconBox}>
                <Ionicons name="barcode-outline" size={18} color="#1E5EFF" />
              </View>
              <Text style={st.detailLabel}>GSTIN</Text>
              <Text style={st.detailVal}>{flow.gstin}</Text>
            </View>
            <View style={st.divider} />

            <View style={st.detailRow}>
              <View style={st.detailIconBox}>
                <Ionicons name="document-text-outline" size={18} color="#1E5EFF" />
              </View>
              <Text style={st.detailLabel}>Form</Text>
              <Text style={st.detailVal}>Form GST REG-06</Text>
            </View>
            <View style={st.divider} />

            <View style={st.detailRow}>
              <View style={st.detailIconBox}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
              </View>
              <Text style={st.detailLabel}>Status</Text>
              <View style={st.statusPill}>
                <Text style={st.statusPillText}>Generated & Saved</Text>
              </View>
            </View>
          </View>

          <View style={st.btnScaleAnimWrap}>
            {Boolean(flow.certificatePdfUri) && (
              <TouchableOpacity
                style={st.blueOutlineBtn}
                activeOpacity={0.8}
                onPress={() =>
                  flow.downloadAndSharePdf(flow.certificatePdfUri!, flow.generatedFileName)
                }
              >
                <Ionicons name="share-outline" size={18} color="#1E5EFF" style={st.iconMarginRight8} />
                <Text style={st.blueOutlineBtnText}>Share / Save Certificate</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={st.blueOutlineBtn}
              activeOpacity={0.8}
              onPress={() => flow.router.replace("/(main)/applications")}
            >
              <Ionicons name="folder-outline" size={18} color="#1E5EFF" style={st.iconMarginRight8} />
              <Text style={st.blueOutlineBtnText}>Go to My Applications</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Select Modal */}
      <GstSelectModal
        visible={flow.showTypeModal}
        title="Select Certificate Request Purpose"
        options={CERTIFICATE_REQUEST_TYPES}
        selectedValue={flow.requestType}
        onSelect={(opt: string) => {
          flow.setRequestType(opt);
          flow.setError("");
          flow.setShowTypeModal(false);
        }}
        onClose={() => flow.setShowTypeModal(false)}
      />

      <UniversalDraftModal
        visible={flow.draftGuard.showDraftModal}
        title="Save Certificate Draft?"
        message="You have unsaved changes in your certificate request. Save your progress so you can resume anytime."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={flow.draftGuard.handleSaveAndExit}
        onDiscardAndExit={flow.draftGuard.handleDiscardAndExit}
        onCancel={flow.draftGuard.handleCancel}
      />
    </View>
  );
}

export default GstCertificateScreen;
