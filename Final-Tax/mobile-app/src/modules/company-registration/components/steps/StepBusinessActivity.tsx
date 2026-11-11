import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { validateBusinessActivity, validateNicCode } from '../../validation/companySchema';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepBusinessActivity.styles';

export const StepBusinessActivity: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const updateDetails = useCompanyRegistrationStore((state) => state.updateCompanyDetails);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);
  const setFieldErrors = useCompanyRegistrationStore((state) => state.setFieldErrors);

  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) {
      const next = { ...fieldErrors };
      delete next[key];
      setFieldErrors(next);
    }
  };

  const handlePrimaryChange = (val: string) => {
    updateDetails({ primaryActivity: val });
    const err = validateBusinessActivity(val, true);
    if (!err) {
      clearFieldError('primaryActivity');
    }
  };

  const handlePrimaryBlur = () => {
    const err = validateBusinessActivity(company.primaryActivity, true);
    if (err) {
      setFieldErrors({ ...fieldErrors, primaryActivity: err });
    }
  };

  const handleNicChange = (val: string) => {
    updateDetails({ nicCode: val });
    const err = validateNicCode(val);
    if (!err) {
      clearFieldError('nicCode');
    }
  };

  const handleNicBlur = () => {
    const err = validateNicCode(company.nicCode);
    if (err) {
      setFieldErrors({ ...fieldErrors, nicCode: err });
    }
  };

  const handleSecondaryChange = (val: string) => {
    updateDetails({ secondaryActivity: val });
    const err = validateBusinessActivity(val, false);
    if (!err) {
      clearFieldError('secondaryActivity');
    } else {
      setFieldErrors({ ...fieldErrors, secondaryActivity: err });
    }
  };

  const handleSecondaryBlur = () => {
    const err = validateBusinessActivity(company.secondaryActivity, false);
    if (err) {
      setFieldErrors({ ...fieldErrors, secondaryActivity: err });
    }
  };

  return (
    <CompanySectionCard
      iconName="briefcase-outline"
      title="Business Activity / NIC"
      description="Define the main objective and National Industrial Classification code of your company."
    >
      {/* Primary Business Activity */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Primary Business Activity *</Text>
        <TextInput
          style={[styles.input, !!fieldErrors.primaryActivity && styles.inputError]}
          value={company.primaryActivity || ''}
          onChangeText={handlePrimaryChange}
          onBlur={handlePrimaryBlur}
          placeholder="Enter Primary Business Activity"
          placeholderTextColor="#94A3B8"
        />
        {!!fieldErrors.primaryActivity ? (
          <Text style={styles.errorText}>{fieldErrors.primaryActivity}</Text>
        ) : (
          <Text style={styles.hint}>Used for Main Objects in MoA Memorandum of Association.</Text>
        )}
      </View>

      {/* NIC Code */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>NIC 5-Digit Code *</Text>
        <TextInput
          style={[styles.input, !!fieldErrors.nicCode && styles.inputError]}
          value={company.nicCode || ''}
          onChangeText={handleNicChange}
          onBlur={handleNicBlur}
          placeholder="Enter 5-digit NIC Code"
          keyboardType="numeric"
          maxLength={5}
          placeholderTextColor="#94A3B8"
        />
        {!!fieldErrors.nicCode ? (
          <Text style={styles.errorText}>{fieldErrors.nicCode}</Text>
        ) : (
          <Text style={styles.hint}>National Industrial Classification 5-Digit Code.</Text>
        )}
      </View>

      {/* Secondary Business Activity */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Secondary Business Activity (Optional)</Text>
        <TextInput
          style={[styles.input, styles.multilineInput, !!fieldErrors.secondaryActivity && styles.inputError]}
          value={company.secondaryActivity || ''}
          onChangeText={handleSecondaryChange}
          onBlur={handleSecondaryBlur}
          placeholder="Enter Secondary Business Activity"
          multiline
          placeholderTextColor="#94A3B8"
        />
        {!!fieldErrors.secondaryActivity && (
          <Text style={styles.errorText}>{fieldErrors.secondaryActivity}</Text>
        )}
      </View>
    </CompanySectionCard>
  );
};
