import React from "react";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Dropdown } from "@/shared/components/Dropdown";
import { INDIAN_STATES_AND_UTS } from "@/components/screens/create-profile/types";
import {
  PROPERTY_TYPE_OPTIONS,
  type PropertyOwnership,
  type PropertyType,
} from "../../types/property.types";
import { getOwnershipOptions } from "../../utils/propertyFlow";
import {
  PROPERTY_CITY_MAX_LENGTH,
  PROPERTY_OTHER_MAX_LENGTH,
} from "../../validation/propertyLoanValidation";
import { PropertyTextField } from "../PropertyTextField/PropertyTextField";
import type { PropertySectionProps } from "./types";
import { styles } from "./PropertySections.styles";

const PROPERTY_TYPES = [...PROPERTY_TYPE_OPTIONS];
const STATES = [...INDIAN_STATES_AND_UTS];
const PIN_LENGTH = 6;

/** Section B: what the property is, where it is, and who owns it. */
export const PropertyDetailsSection: React.FC<PropertySectionProps> = ({
  data,
  errors,
  onChangeField,
}) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Ionicons name="home-outline" size={18} color="#083B75" />
      <Text style={styles.title}>Property Details</Text>
    </View>

    <Dropdown
      label="Property Type"
      required
      options={PROPERTY_TYPES}
      value={data.propertyType}
      onSelect={(value) => onChangeField("propertyType", value as PropertyType)}
      placeholder="Select property type"
      error={errors.propertyType}
    />

    {data.propertyType === "Other" ? (
      <PropertyTextField
        label="Please specify"
        value={data.propertyTypeOther}
        onChange={(text) => onChangeField("propertyTypeOther", text)}
        placeholder="Type of property"
        maxLength={PROPERTY_OTHER_MAX_LENGTH}
        error={errors.propertyTypeOther}
      />
    ) : null}

    <PropertyTextField
      label="City"
      value={data.city}
      onChange={(text) => onChangeField("city", text)}
      placeholder="e.g. Hyderabad"
      maxLength={PROPERTY_CITY_MAX_LENGTH}
      error={errors.city}
    />

    <Dropdown
      label="State"
      required
      options={STATES}
      value={data.state}
      onSelect={(value) => onChangeField("state", value)}
      placeholder="Select state / UT"
      error={errors.state}
    />

    <PropertyTextField
      label="PIN Code"
      value={data.pinCode}
      onChange={(text) => onChangeField("pinCode", text)}
      placeholder="6-digit PIN code"
      maxLength={PIN_LENGTH}
      keyboardType="number-pad"
      error={errors.pinCode}
    />

    <Dropdown
      label="Property Ownership"
      required
      options={[...getOwnershipOptions(data.purpose)]}
      value={data.ownership}
      onSelect={(value) => onChangeField("ownership", value as PropertyOwnership)}
      placeholder="Select ownership"
      error={errors.ownership}
    />
  </View>
);
