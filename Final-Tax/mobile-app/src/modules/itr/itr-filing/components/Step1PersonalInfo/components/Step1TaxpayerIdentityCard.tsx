import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ItrPersonalInfo } from "../../../types/itrFiling.types";
import { styles } from "../Step1PersonalInfo.styles";

interface Step1TaxpayerIdentityCardProps {
  personalInfo: ItrPersonalInfo;
}

export const Step1TaxpayerIdentityCard: React.FC<Step1TaxpayerIdentityCardProps> = ({
  personalInfo,
}) => {
  const maskedAadhaar = personalInfo.aadhaar
    ? `•••• •••• ${personalInfo.aadhaar.slice(-4)}`
    : "Not provided";

  const formattedMobile = personalInfo.mobile
    ? personalInfo.mobile.startsWith("+")
      ? personalInfo.mobile
      : `+91 ${personalInfo.mobile}`
    : "Not provided";

  const formattedAddress =
    personalInfo.address ||
    [personalInfo.city, personalInfo.state].filter(Boolean).join(", ") ||
    "Not provided";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="person-circle" size={20} color="#083B75" />
          <Text style={styles.cardTitle}>Taxpayer Identity</Text>
        </View>
        <View style={styles.verifiedTag}>
          <Ionicons name="shield-checkmark" size={13} color="#166534" />
          <Text style={styles.verifiedTagText}>Auto-Verified</Text>
        </View>
      </View>

      <Text style={styles.cardDescription}>
        Information verified from your Finsolz profile. Please verify your legal PAN, Aadhaar, and registered details.
      </Text>

      <View style={styles.readOnlyGrid}>
        <View style={styles.readOnlyRow}>
          <Text style={styles.fieldLabel}>PAN Number</Text>
          <Text style={styles.fieldValueHighlight}>{personalInfo.pan || "Not provided"}</Text>
        </View>
        <View style={styles.readOnlyRow}>
          <Text style={styles.fieldLabel}>Aadhaar Number</Text>
          <Text style={styles.fieldValue}>{maskedAadhaar}</Text>
        </View>
        <View style={styles.readOnlyRow}>
          <Text style={styles.fieldLabel}>Full Legal Name</Text>
          <Text style={styles.fieldValue}>{personalInfo.name || "Not provided"}</Text>
        </View>
        {Boolean(personalInfo.dob) && (
          <View style={styles.readOnlyRow}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <Text style={styles.fieldValue}>{personalInfo.dob}</Text>
          </View>
        )}
        <View style={styles.readOnlyRow}>
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <Text style={styles.fieldValue}>{formattedMobile}</Text>
        </View>
        <View style={styles.readOnlyRow}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <Text style={styles.fieldValue}>{personalInfo.email || "Not provided"}</Text>
        </View>
        <View style={styles.readOnlyRow}>
          <Text style={styles.fieldLabel}>Registered Address</Text>
          <Text style={styles.fieldValue}>{formattedAddress}</Text>
        </View>
      </View>
    </View>
  );
};
