import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import type { CompanyType } from '../../types/company.types';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepCompanyType.styles';

interface CompanyOption {
  type: CompanyType;
  title: string;
  desc: string;
  badge?: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const OPTIONS: CompanyOption[] = [
  {
    type: 'Private Limited',
    title: 'Private Limited (Pvt Ltd)',
    desc: 'Startups & growing ventures • Equity funding ready',
    badge: 'POPULAR',
    icon: 'business-outline',
  },
  {
    type: 'Limited Liability Partnership (LLP)',
    title: 'Limited Liability Partnership (LLP)',
    desc: 'Partners & professional firms • Low compliance overhead',
    icon: 'briefcase-outline',
  },
  {
    type: 'One Person Company (OPC)',
    title: 'One Person Company (OPC)',
    desc: 'Single founder structure • 100% individual control',
    icon: 'person-outline',
  },
  {
    type: 'Section 8 (NGO)',
    title: 'Section 8 Company (NGO)',
    desc: 'Non-profit organization • Social welfare & foundations',
    icon: 'heart-outline',
  },
  {
    type: 'Public Limited',
    title: 'Public Limited Company',
    desc: 'Large scale corporate • Public shareholding & listing',
    icon: 'globe-outline',
  },
];

export const StepCompanyType: React.FC = () => {
  const selectedType = useCompanyRegistrationStore((state) => state.draft.company.companyType);
  const setCompanyType = useCompanyRegistrationStore((state) => state.setCompanyType);
  const errorText = useCompanyRegistrationStore((state) => state.fieldErrors.companyType);

  return (
    <View style={styles.container}>
      <CompanySectionCard
        iconName="business-outline"
        title="Select Company Structure"
        subtitle="Choose legal structure to begin incorporation."
      >

      {OPTIONS.map((item) => {
        const isSelected = selectedType === item.type;
        return (
          <TouchableOpacity
            key={item.type}
            style={[styles.card, isSelected ? styles.cardSelected : styles.cardUnselected]}
            onPress={() => setCompanyType(item.type)}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconContainer,
                  isSelected ? styles.iconContainerSelected : styles.iconContainerUnselected,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={isSelected ? '#FF8A00' : '#82909F'}
                />
              </View>

              <View style={styles.contentCol}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, isSelected && styles.titleSelected]}>
                    {item.title}
                  </Text>
                  {!!item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.description}>{item.desc}</Text>
              </View>

              <View
                style={[
                  styles.radioOuter,
                  isSelected ? styles.radioOuterSelected : styles.radioOuterUnselected,
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
      </CompanySectionCard>
    </View>
  );
};
