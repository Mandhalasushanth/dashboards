import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import type { CompanyCategory, CompanySubCategory } from '../../types/company.types';
import { isOpcCompanyType } from '../../validation/companySchema';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepClassification.styles';

export const StepClassification: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const updateDetails = useCompanyRegistrationStore((state) => state.updateCompanyDetails);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);

  const getAvailableCategories = (): CompanyCategory[] => {
    if (isOpcCompanyType(company.companyType)) return ['Company limited by Shares'];
    if (company.companyType === 'Section 8 (NGO)') return ['Company limited by Guarantee', 'Company limited by Shares'];
    return ['Company limited by Shares', 'Company limited by Guarantee', 'Unlimited Company'];
  };

  const getAvailableSubCategories = (): CompanySubCategory[] => {
    if (isOpcCompanyType(company.companyType)) return ['Indian Non-Government Company'];
    return ['Indian Non-Government Company', 'State Government Company', 'Central Government Company'];
  };

  const categories = getAvailableCategories();
  const subCategories = getAvailableSubCategories();

  const handleCategorySelect = (cat: CompanyCategory) => {
    updateDetails({ companyCategory: cat });
    const validSubs = getAvailableSubCategories();
    if (company.companySubCategory && !validSubs.includes(company.companySubCategory)) {
      updateDetails({ companyCategory: cat, companySubCategory: validSubs[0] });
    }
  };

  return (
    <CompanySectionCard
      iconName="layers-outline"
      title="Company Classification"
      description="Specify MCA statutory classification details for incorporation filing."
    >
      {/* Category of Company */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Category of Company *</Text>
        <View style={styles.optionRow}>
          {categories.map((cat) => {
            const selected = company.companyCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
                onPress={() => handleCategorySelect(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!!fieldErrors.companyCategory && <Text style={styles.errorText}>{fieldErrors.companyCategory}</Text>}
      </View>

      {/* Sub-Category of Company */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Sub-Category of Company *</Text>
        <View style={styles.optionRow}>
          {subCategories.map((subCat) => {
            const selected = company.companySubCategory === subCat;
            return (
              <TouchableOpacity
                key={subCat}
                style={[styles.optionChip, selected && styles.optionChipSelected]}
                onPress={() => updateDetails({ companySubCategory: subCat })}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>{subCat}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!!fieldErrors.companySubCategory && <Text style={styles.errorText}>{fieldErrors.companySubCategory}</Text>}
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#1E40AF" />
        <Text style={styles.infoText}>Standard commercial startups default to Indian Non-Government Company limited by shares.</Text>
      </View>
    </CompanySectionCard>
  );
};

export default StepClassification;
