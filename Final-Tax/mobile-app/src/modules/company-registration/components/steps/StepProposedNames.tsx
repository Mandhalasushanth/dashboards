import React, { useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { getSuffixForType, validateProposedCompanyName } from '../../validation/companySchema';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepProposedNames.styles';

export const StepProposedNames: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const updateDetails = useCompanyRegistrationStore((state) => state.updateCompanyDetails);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);
  const setFieldErrors = useCompanyRegistrationStore((state) => state.setFieldErrors);

  const suffix = getSuffixForType(company.companyType);

  useEffect(() => {
    if (company.nameSuffix !== suffix) {
      updateDetails({ nameSuffix: suffix });
    }
  }, [company.companyType, suffix]);

  const handleBlur1 = () => {
    const errorMsg = validateProposedCompanyName(company.proposedName1, suffix);
    if (errorMsg) {
      setFieldErrors({ ...fieldErrors, proposedName1: errorMsg });
    }
  };

  const handleChangeText1 = (val: string) => {
    updateDetails({ proposedName1: val });
    const err = validateProposedCompanyName(val, suffix);
    if (!err && fieldErrors.proposedName1) {
      const nextErrors = { ...fieldErrors };
      delete nextErrors.proposedName1;
      setFieldErrors(nextErrors);
    }
  };

  const handleBlur2 = () => {
    const errorMsg = validateProposedCompanyName(company.proposedName2, suffix);
    if (errorMsg) {
      setFieldErrors({ ...fieldErrors, proposedName2: errorMsg });
    } else if (
      company.proposedName1?.trim() &&
      company.proposedName2?.trim() &&
      company.proposedName1.trim().toLowerCase() === company.proposedName2.trim().toLowerCase()
    ) {
      setFieldErrors({
        ...fieldErrors,
        proposedName2: 'Alternative name must be distinct from primary proposed name.',
      });
    }
  };

  const handleChangeText2 = (val: string) => {
    updateDetails({ proposedName2: val });
    const err = validateProposedCompanyName(val, suffix);
    if (!err && fieldErrors.proposedName2) {
      const nextErrors = { ...fieldErrors };
      delete nextErrors.proposedName2;
      setFieldErrors(nextErrors);
    }
  };

  return (
    <CompanySectionCard
      iconName="text-outline"
      title="Proposed Company Names"
      description="Provide your preferred name options for SPICe+ Part A name reservation / incorporation."
    >
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Proposed Company Name (Option 1) *</Text>
        <TextInput
          style={[styles.input, !!fieldErrors.proposedName1 && styles.inputError]}
          value={company.proposedName1 || ''}
          onChangeText={handleChangeText1}
          onBlur={handleBlur1}
          placeholder="Enter primary proposed company name"
          placeholderTextColor="#94A3B8"
        />
        {!!suffix && <Text style={styles.suffixLabel}>Legal suffix: {suffix}</Text>}
        {!!fieldErrors.proposedName1 && <Text style={styles.errorText}>{fieldErrors.proposedName1}</Text>}
      </View>

      <View style={[styles.fieldGroup, { marginTop: 14 }]}>
        <Text style={styles.label}>Alternative Proposed Name (Option 2) *</Text>
        <TextInput
          style={[styles.input, !!fieldErrors.proposedName2 && styles.inputError]}
          value={company.proposedName2 || ''}
          onChangeText={handleChangeText2}
          onBlur={handleBlur2}
          placeholder="Enter alternative proposed company name"
          placeholderTextColor="#94A3B8"
        />
        {!!suffix && <Text style={styles.suffixLabel}>Legal suffix: {suffix}</Text>}
        {!!fieldErrors.proposedName2 && <Text style={styles.errorText}>{fieldErrors.proposedName2}</Text>}
      </View>
    </CompanySectionCard>
  );
};

export default StepProposedNames;
