import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import {
  validatePinCode,
  validateCompanyEmail,
  validateCompanyMobile,
  validateAddressLine,
  validateLocationName,
} from '../../validation/companySchema';
import { pinCodeService } from '@/shared/services/lookup/pinCodeService';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepRegisteredOffice.styles';

export const StepRegisteredOffice: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const updateDetails = useCompanyRegistrationStore((state) => state.updateCompanyDetails);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);
  const setFieldErrors = useCompanyRegistrationStore((state) => state.setFieldErrors);

  const clearError = (key: string) => {
    if (fieldErrors[key]) {
      const next = { ...fieldErrors };
      delete next[key];
      setFieldErrors(next);
    }
  };

  const handleOwnershipChange = (status: 'Rented' | 'Owned' | 'Leased') => {
    clearError('premisesOwnership');
    updateDetails({ premisesOwnership: status });
  };

  const handleTextChange = (
    key: keyof typeof company,
    val: string,
    validator?: (v: string) => string | null
  ) => {
    updateDetails({ [key]: val });
    if (validator && !validator(val)) clearError(key);
  };

  const handleTextBlur = (
    key: keyof typeof company,
    validator: (v: string) => string | null
  ) => {
    const raw = (company[key] as string) || '';
    const trimmed = raw.trim();
    if (trimmed !== raw) updateDetails({ [key]: trimmed });
    const err = validator(trimmed);
    if (err) setFieldErrors({ ...fieldErrors, [key]: err });
  };

  const handlePincodeChange = async (val: string) => {
    updateDetails({ registeredPincode: val });
    const err = validatePinCode(val);
    if (!err) {
      clearError('registeredPincode');
      if (val.trim().length === 6) {
        try {
          const details = await pinCodeService.lookup(val.trim());
          if (details) {
            updateDetails({
              registeredCity: company.registeredCity || details.city,
              registeredDistrict: company.registeredDistrict || details.district,
              registeredState: company.registeredState || details.state,
            });
            if (details.city) clearError('registeredCity');
            if (details.district) clearError('registeredDistrict');
            if (details.state) clearError('registeredState');
          }
        } catch {
          // Format validation authoritative; lookup advisory
        }
      }
    } else if (val.trim()) {
      setFieldErrors({ ...fieldErrors, registeredPincode: err });
    }
  };

  return (
    <View style={styles.container}>
      {/* CARD A — BUILDING / ADDRESS */}
      <CompanySectionCard
        iconName="location-outline"
        title="Building / Address"
        description="Provide official communication address for MCA, ROC, and statutory authorities."
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Building / Premises Address Line *</Text>
          <TextInput
            style={[styles.input, !!fieldErrors.registeredAddressLine && styles.inputError]}
            value={company.registeredAddressLine || ''}
            onChangeText={(v) => handleTextChange('registeredAddressLine', v, validateAddressLine)}
            onBlur={() => handleTextBlur('registeredAddressLine', validateAddressLine)}
            placeholder="Enter registered address"
            placeholderTextColor="#94A3B8"
          />
          {!!fieldErrors.registeredAddressLine && <Text style={styles.errorText}>{fieldErrors.registeredAddressLine}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.registeredCity && styles.inputError]}
              value={company.registeredCity || ''}
              onChangeText={(v) => handleTextChange('registeredCity', v, (val) => validateLocationName(val, 'City'))}
              onBlur={() => handleTextBlur('registeredCity', (val) => validateLocationName(val, 'City'))}
              placeholder="Enter city"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.registeredCity && <Text style={styles.errorText}>{fieldErrors.registeredCity}</Text>}
          </View>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>District *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.registeredDistrict && styles.inputError]}
              value={company.registeredDistrict || ''}
              onChangeText={(v) => handleTextChange('registeredDistrict', v, (val) => validateLocationName(val, 'District'))}
              onBlur={() => handleTextBlur('registeredDistrict', (val) => validateLocationName(val, 'District'))}
              placeholder="Enter district"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.registeredDistrict && <Text style={styles.errorText}>{fieldErrors.registeredDistrict}</Text>}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>State *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.registeredState && styles.inputError]}
              value={company.registeredState || ''}
              onChangeText={(v) => handleTextChange('registeredState', v, (val) => validateLocationName(val, 'State'))}
              onBlur={() => handleTextBlur('registeredState', (val) => validateLocationName(val, 'State'))}
              placeholder="Enter state"
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.registeredState && <Text style={styles.errorText}>{fieldErrors.registeredState}</Text>}
          </View>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>PIN Code *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.registeredPincode && styles.inputError]}
              value={company.registeredPincode || ''}
              onChangeText={handlePincodeChange}
              onBlur={() => handleTextBlur('registeredPincode', validatePinCode)}
              placeholder="Enter 6-digit PIN code"
              keyboardType="numeric"
              maxLength={6}
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.registeredPincode && <Text style={styles.errorText}>{fieldErrors.registeredPincode}</Text>}
          </View>
        </View>
      </CompanySectionCard>

      {/* CARD B — PREMISES OWNERSHIP */}
      <CompanySectionCard
        iconName="home-outline"
        title="Premises Ownership"
        description="Select premises occupancy status and ownership proof."
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Premises Ownership Status *</Text>
          <View style={styles.chipRow}>
            {(['Rented', 'Owned', 'Leased'] as const).map((status) => {
              const isSelected = company.premisesOwnership === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => handleOwnershipChange(status)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{status}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {!!fieldErrors.premisesOwnership && <Text style={styles.errorText}>{fieldErrors.premisesOwnership}</Text>}
        </View>
      </CompanySectionCard>

      {/* CARD C — CONTACT DETAILS */}
      <CompanySectionCard
        iconName="call-outline"
        title="Contact Details"
        description="Official communications email and mobile for MCA & ROC alerts."
      >
        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Company Email *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.companyEmail && styles.inputError]}
              value={company.companyEmail || ''}
              onChangeText={(v) => handleTextChange('companyEmail', v, validateCompanyEmail)}
              onBlur={() => handleTextBlur('companyEmail', validateCompanyEmail)}
              placeholder="Enter company email"
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={254}
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.companyEmail && <Text style={styles.errorText}>{fieldErrors.companyEmail}</Text>}
          </View>
          <View style={[styles.fieldGroup, styles.halfField]}>
            <Text style={styles.label}>Mobile *</Text>
            <TextInput
              style={[styles.input, !!fieldErrors.companyMobile && styles.inputError]}
              value={company.companyMobile || ''}
              onChangeText={(v) => handleTextChange('companyMobile', v, validateCompanyMobile)}
              onBlur={() => handleTextBlur('companyMobile', validateCompanyMobile)}
              placeholder="Enter 10-digit mobile"
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#94A3B8"
            />
            {!!fieldErrors.companyMobile && <Text style={styles.errorText}>{fieldErrors.companyMobile}</Text>}
          </View>
        </View>
      </CompanySectionCard>
    </View>
  );
};

export default StepRegisteredOffice;
