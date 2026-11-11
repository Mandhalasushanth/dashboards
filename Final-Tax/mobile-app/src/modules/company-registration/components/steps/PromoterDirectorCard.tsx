import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { UniversalDatePicker } from '@/shared/components/UniversalDatePicker';
import type { DirectorInfo } from '../../types/director.types';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import {
  validatePersonName,
  validateDesignation,
  validateDirectorPan,
  validateDirectorEmail,
  validateDirectorMobile,
  validateDirectorDob,
  validateDirectorDin,
  directorSchema,
} from '../../validation/directorSchema';
import { styles } from './StepPromoters.styles';

export interface PromoterDirectorCardProps {
  director: DirectorInfo;
  index: number;
  isExpanded: boolean;
  canRemove: boolean;
  shareholdingPct: string;
  onToggleExpand: () => void;
  onSave: (updated: Partial<DirectorInfo>) => void;
  onDeleteRequest: () => void;
}

export const PromoterDirectorCard: React.FC<PromoterDirectorCardProps> = ({
  director,
  index,
  isExpanded,
  canRemove,
  shareholdingPct,
  onToggleExpand,
  onSave,
  onDeleteRequest,
}) => {
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);
  const setFieldErrors = useCompanyRegistrationStore((state) => state.setFieldErrors);
  const [formData, setFormData] = useState<DirectorInfo>(director);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setFormData(director); }, [director]);

  const getErr = (k: string) => fieldErrors[`dir_${director.id}_${k}`];
  const setSingleFieldError = (k: string, msg: string) => setFieldErrors({ ...fieldErrors, [`dir_${director.id}_${k}`]: msg });
  const clearFieldError = (k: string) => {
    const full = `dir_${director.id}_${k}`;
    if (fieldErrors[full]) {
      const next = { ...fieldErrors };
      delete next[full];
      setFieldErrors(next);
    }
  };
  const updateField = (fields: Partial<DirectorInfo>) => setFormData((prev) => ({ ...prev, ...fields }));

  const handleFieldChange = (key: keyof DirectorInfo, val: string, validator?: (v: string) => string | null) => {
    updateField({ [key]: val });
    if (validator && !validator(val)) clearFieldError(key as string);
  };

  const handleFieldBlur = (key: keyof DirectorInfo, validator: (v: string) => string | null) => {
    const raw = (formData[key] as string) || '';
    const trimmed = raw.trim();
    if (trimmed !== raw) updateField({ [key]: trimmed });
    const err = validator(trimmed);
    if (err) setSingleFieldError(key as string, err);
  };

  const handleDobChange = (val: string) => {
    updateField({ dob: val });
    if (!validateDirectorDob(val)) clearFieldError('dob');
  };

  const handleDobBlur = () => {
    const err = validateDirectorDob((formData.dob || '').trim());
    if (err) setSingleFieldError('dob', err);
  };

  const handleSavePress = () => {
    const trimmedData: DirectorInfo = {
      ...formData,
      name: (formData.name || '').trim(),
      pan: (formData.pan || '').trim().toUpperCase(),
      email: (formData.email || '').trim(),
      phone: (formData.phone || '').trim(),
      dob: (formData.dob || '').trim(),
      designation: (formData.designation || '').trim(),
      din: (formData.din || '').trim(),
      hasDin: !!formData.din?.trim(),
    };
    setFormData(trimmedData);

    const { valid, fieldErrors: errs } = directorSchema.validateDirector(trimmedData, index);
    if (!valid) {
      setFieldErrors({ ...fieldErrors, ...errs });
      return;
    }
    const nextErrors = { ...fieldErrors };
    const prefix = `dir_${director.id}_`;
    Object.keys(nextErrors).forEach((k) => { if (k.startsWith(prefix)) delete nextErrors[k]; });
    setFieldErrors(nextErrors);
    onSave(trimmedData);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.cardHeaderLeft} onPress={onToggleExpand} activeOpacity={0.8}>
          <View style={styles.avatarBox}>
            <Ionicons name="person-outline" size={18} color="#FF8A00" />
          </View>
          <View style={styles.cardTitleGroup}>
            <Text style={styles.cardTitle}>Director #{index + 1}</Text>
            <Text style={styles.cardSubtitle} numberOfLines={1}>{director.name || 'Enter Director Details'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.cardHeaderRight}>
          <TouchableOpacity style={styles.editBtnHeader} onPress={onToggleExpand} activeOpacity={0.7}>
            <Ionicons name={isExpanded ? 'chevron-up' : 'pencil'} size={16} color="#FF8A00" />
            <Text style={styles.editBtnHeaderText}>{isExpanded ? 'Collapse' : 'Edit'}</Text>
          </TouchableOpacity>
          {canRemove && (
            <TouchableOpacity style={styles.deleteBtnHeader} onPress={onDeleteRequest} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={16} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!isExpanded && (
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>PAN: <Text style={styles.summaryBold}>{director.pan || 'N/A'}</Text></Text>
            <Text style={styles.summaryText}>Mobile: <Text style={styles.summaryBold}>{director.phone || 'N/A'}</Text></Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Email: <Text style={styles.summaryBold}>{director.email || 'N/A'}</Text></Text>
            <Text style={styles.summaryText}>Shareholding: <Text style={styles.summaryBold}>{shareholdingPct}</Text></Text>
          </View>
        </View>
      )}

      {isExpanded && (
        <View style={styles.cardContent}>
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Full Name (as in PAN) *</Text>
              <TextInput
                style={[styles.input, !!getErr('name') && styles.inputError]}
                value={formData.name}
                onChangeText={(v) => handleFieldChange('name', v, (val) => validatePersonName(val, true, 'Full name'))}
                onBlur={() => handleFieldBlur('name', (val) => validatePersonName(val, true, 'Full name'))}
                placeholder="Full Legal Name"
                maxLength={100}
                placeholderTextColor="#94A3B8"
              />
              {!!getErr('name') && <Text style={styles.errorText}>{getErr('name')}</Text>}
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>PAN Number *</Text>
              <TextInput
                style={[styles.input, !!getErr('pan') && styles.inputError]}
                value={formData.pan}
                onChangeText={(v) => handleFieldChange('pan', v.toUpperCase(), validateDirectorPan)}
                onBlur={() => handleFieldBlur('pan', validateDirectorPan)}
                placeholder="10-character PAN"
                autoCapitalize="characters"
                maxLength={10}
                placeholderTextColor="#94A3B8"
              />
              {!!getErr('pan') && <Text style={styles.errorText}>{getErr('pan')}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <UniversalDatePicker
                label="Date of Birth"
                required
                value={formData.dob || ''}
                onChange={handleDobChange}
                onBlur={handleDobBlur}
                error={getErr('dob')}
                valueFormat="DD-MM-YYYY"
                placeholder="DD-MM-YYYY"
                maximumDate={new Date()}
                initialPickerDate={new Date(1990, 0, 1)}
                allowManualEntry
                iconColor="#FF8A00"
                showErrorText={false}
                containerStyle={{ marginBottom: 0 }}
                inputStyle={{
                  height: 42,
                  borderRadius: 8,
                  borderColor: getErr('dob') ? '#EF4444' : '#E7EDF2',
                  backgroundColor: '#FFFFFF',
                  paddingHorizontal: 12,
                }}
              />
              {!!getErr('dob') && <Text style={styles.errorText}>{getErr('dob')}</Text>}
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Designation *</Text>
              <TextInput
                style={[styles.input, !!getErr('designation') && styles.inputError]}
                value={formData.designation || ''}
                onChangeText={(v) => handleFieldChange('designation', v, (val) => validateDesignation(val, true))}
                onBlur={() => handleFieldBlur('designation', (val) => validateDesignation(val, true))}
                placeholder="e.g. Director"
                maxLength={50}
                placeholderTextColor="#94A3B8"
              />
              {!!getErr('designation') && <Text style={styles.errorText}>{getErr('designation')}</Text>}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, !!getErr('email') && styles.inputError]}
                value={formData.email || ''}
                onChangeText={(v) => handleFieldChange('email', v, validateDirectorEmail)}
                onBlur={() => handleFieldBlur('email', validateDirectorEmail)}
                placeholder="Enter Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={254}
                placeholderTextColor="#94A3B8"
              />
              {!!getErr('email') && <Text style={styles.errorText}>{getErr('email')}</Text>}
            </View>

            <View style={[styles.fieldGroup, styles.halfField]}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                style={[styles.input, !!getErr('phone') && styles.inputError]}
                value={formData.phone || ''}
                onChangeText={(v) => handleFieldChange('phone', v, validateDirectorMobile)}
                onBlur={() => handleFieldBlur('phone', validateDirectorMobile)}
                placeholder="Enter 10-digit Mobile"
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#94A3B8"
              />
              {!!getErr('phone') && <Text style={styles.errorText}>{getErr('phone')}</Text>}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>DIN (if already allotted)</Text>
            <TextInput
              style={[styles.input, !!getErr('din') && styles.inputError]}
              value={formData.din || ''}
              onChangeText={(v) => {
                updateField({ din: v, hasDin: !!v.trim() });
                const err = validateDirectorDin(v, !!v.trim());
                if (!err) clearFieldError('din');
              }}
              onBlur={() => {
                const trimmed = (formData.din || '').trim();
                updateField({ din: trimmed, hasDin: !!trimmed });
                const err = validateDirectorDin(trimmed, !!trimmed);
                if (err) setSingleFieldError('din', err);
              }}
              placeholder="8-digit DIN (Optional)"
              keyboardType="numeric"
              maxLength={8}
              placeholderTextColor="#94A3B8"
            />
            {!!getErr('din') && <Text style={styles.errorText}>{getErr('din')}</Text>}
          </View>

          <View style={styles.cardActionsRow}>
            <TouchableOpacity style={styles.cancelFormBtn} onPress={onToggleExpand} activeOpacity={0.7}>
              <Text style={styles.cancelFormText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveFormBtn} onPress={handleSavePress} activeOpacity={0.7}>
              <Ionicons name="checkmark-sharp" size={16} color="#FFFFFF" />
              <Text style={styles.saveFormText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
