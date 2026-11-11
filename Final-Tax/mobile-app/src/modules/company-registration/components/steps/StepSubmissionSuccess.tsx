import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { CompanySectionCard } from '../CompanySectionCard/CompanySectionCard';
import { styles } from './StepSubmissionSuccess.styles';

export const StepSubmissionSuccess: React.FC = () => {
  const router = useRouter();
  const draft = useCompanyRegistrationStore((state) => state.draft);

  const resetRegistration = useCompanyRegistrationStore((state) => state.resetRegistration);

  const appliedDateStr = draft.createdAt || new Date().toISOString().split('T')[0];

  const handleGoToDashboard = () => {
    resetRegistration();
    router.replace('/(main)/home');
  };

  const handleTrackApplication = () => {
    resetRegistration();
    router.replace('/(main)/applications');
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark-done-circle" size={48} color="#166534" />
      </View>
      <Text style={styles.heading}>Application Submitted Successfully</Text>
      <Text style={styles.subheading}>
        Your company incorporation application has been submitted successfully.
      </Text>

      {/* Confirmation Summary Card */}
      <CompanySectionCard
        iconName="receipt-outline"
        title="Application Summary"
        subtitle="Incorporation filing details"
        style={{ width: '100%', marginBottom: 20 }}
      >
        <View style={styles.row}>
          <Text style={styles.label}>Application Reference Number</Text>
          <Text style={styles.value}>{draft.id || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Proposed Company Name</Text>
          <Text style={styles.value}>{draft.company.proposedName1 || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Entity Structure</Text>
          <Text style={styles.value}>{draft.company.companyType || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Submission Date</Text>
          <Text style={styles.value}>{appliedDateStr}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Current Status</Text>
          <Text style={[styles.value, { color: '#166534' }]}>{draft.status || 'Submitted'}</Text>
        </View>
      </CompanySectionCard>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.btnPrimaryContainer}
        onPress={handleGoToDashboard}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FF8A00', '#FF5500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btnPrimary}
        >
          <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          <Text style={styles.btnPrimaryText}>Go to Dashboard</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnSecondary}
        onPress={handleTrackApplication}
        activeOpacity={0.8}
      >
        <Ionicons name="folder-open-outline" size={20} color="#083B75" />
        <Text style={styles.btnSecondaryText}>Track Application</Text>
      </TouchableOpacity>
    </View>
  );
};

export default StepSubmissionSuccess;
