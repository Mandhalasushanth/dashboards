import React from "react";
import {
  View,
  Text,
  ScrollView,
  type ScrollViewInstance,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
} from "react-native";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BrandColors } from "@/shared/theme";
import {
  styles,
  getHeaderBarStyle,
  getCardIconBoxStyle,
} from "./GstAmendmentLanding.styles";
import { CORE_AMENDMENT_SECTIONS } from "../../config/gstCoreAmendmentConfig";
import { NON_CORE_AMENDMENT_SECTIONS } from "../../config/gstNonCoreAmendmentConfig";
import { GstinInfoIcon } from "@/modules/gst/components/common";
import { removeEmoji } from "@/modules/gst/utils/gstEmojiFilter";

interface GstAmendmentLandingProps {
  gstin: string;
  onGstinChange: (text: string) => void;
  errorGstin?: string;
  onSelectSection: (sectionId: string) => void;
  onBack: () => void;
  scrollViewRef: React.RefObject<ScrollView | null> | React.RefObject<ScrollViewInstance | null> | any;
  insets: { top: number; bottom: number };
}

export const GstAmendmentLanding: React.FC<GstAmendmentLandingProps> = ({
  gstin,
  onGstinChange,
  errorGstin,
  onSelectSection,
  onBack,
  scrollViewRef,
  insets,
}) => {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.headerBar, getHeaderBarStyle(insets.top)]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.roundBackButton}
        >
          <Ionicons name="chevron-back" size={22} color={BrandColors.PRIMARY_BLUE} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerMainTitle}>GST Amendment</Text>
          <Text style={styles.headerSubtitle}>Select what you want to change</Text>
        </View>
        <View style={styles.placeholderBox} />
      </View>

      <KeyboardAwareScrollView
        ref={scrollViewRef as any}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            <Ionicons name="information-circle" size={20} color="#0284C7" />
          </View>
          <Text style={styles.infoText}>
            Core amendments require tax officer approval (approx. 15 working days). Non-core
            amendments are auto-approved via portal acknowledgment.
          </Text>
        </View>

        {/* GSTIN Input */}
        <View style={styles.gstinBlock}>
          <View style={styles.gstinLabelRow}>
            <View style={styles.gstinLabelLeft}>
              <Text style={styles.gstinLabel}>
                GSTIN to Amend <Text style={styles.star}>*</Text>
              </Text>
              <GstinInfoIcon />
            </View>
            <Text style={styles.gstinCounter}>{`${gstin.length}/15`}</Text>
          </View>
          <TextInput
            style={[styles.gstinInput, Boolean(errorGstin) && styles.inputError]}
            placeholder="Enter GSTIN"
            placeholderTextColor="#94A3B8"
            value={gstin}
            onChangeText={(text) => onGstinChange(removeEmoji(text))}
            autoCapitalize="characters"
            maxLength={15}
          />
          {errorGstin && <Text style={styles.errorText}>{errorGstin}</Text>}
        </View>

        {/* Core Fields */}
        <Text style={styles.sectionGroupTitle}>Core Fields</Text>
        <Text style={styles.sectionGroupSubtitle}>
          Requires Tax Officer approval & supporting government orders
        </Text>
        <View style={styles.cardGroup}>
          {CORE_AMENDMENT_SECTIONS.map((sec) => (
            <TouchableOpacity
              key={sec.id}
              style={styles.amendmentCard}
              activeOpacity={0.7}
              onPress={() => onSelectSection(sec.id)}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBox, !sec.image && getCardIconBoxStyle(sec.iconColor)]}>
                  {sec.image ? (
                    <Image source={sec.image} style={styles.cardIconImage} resizeMode="cover" />
                  ) : (
                    sec.icon && <Ionicons name={sec.icon} size={22} color={sec.iconColor} />
                  )}
                </View>
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardTitle}>{sec.title}</Text>
                  <Text style={styles.cardDesc}>{sec.typeLabel}</Text>
                  <View style={[styles.cardBadge, styles.coreBadge]}>
                    <Text style={[styles.cardBadgeText, styles.coreBadgeText]}>
                      Approval Required
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Non-Core Fields */}
        <Text style={styles.sectionGroupTitle}>Non-Core Fields</Text>
        <Text style={styles.sectionGroupSubtitle}>
          Auto-updated on GST Portal after submission
        </Text>
        <View style={styles.cardGroup}>
          {NON_CORE_AMENDMENT_SECTIONS.map((sec) => (
            <TouchableOpacity
              key={sec.id}
              style={styles.amendmentCard}
              activeOpacity={0.7}
              onPress={() => onSelectSection(sec.id)}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.cardIconBox, !sec.image && getCardIconBoxStyle(sec.iconColor)]}>
                  {sec.image ? (
                    <Image source={sec.image} style={styles.cardIconImage} resizeMode="cover" />
                  ) : (
                    sec.icon && <Ionicons name={sec.icon} size={22} color={sec.iconColor} />
                  )}
                </View>
                <View style={styles.cardTextWrap}>
                  <Text style={styles.cardTitle}>{sec.title}</Text>
                  <Text style={styles.cardDesc}>{sec.typeLabel}</Text>
                  <View style={[styles.cardBadge, styles.nonCoreBadge]}>
                    <Text style={[styles.cardBadgeText, styles.nonCoreBadgeText]}>
                      Auto Approved
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};
