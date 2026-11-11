import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import type { DirectorInfo, OpcNomineeInfo } from '../../types/director.types';
import {
  validatePersonName,
  validateDirectorPan,
  validateNomineeRelationship,
  validateDirectorEmail,
  validateDirectorMobile,
  validateNomineeAadhaar,
} from '../../validation/directorSchema';
import { isOpcCompanyType, getMinRequiredPromoters } from '../../validation/companySchema';
import { PromoterDirectorCard } from './PromoterDirectorCard';
import { DeleteDirectorModal } from './DeleteDirectorModal';
import { styles } from './StepPromoters.styles';

export const StepPromoters: React.FC = () => {
  const company = useCompanyRegistrationStore((state) => state.draft.company);
  const directors = useCompanyRegistrationStore((state) => state.draft.directors);
  const opcNominee = useCompanyRegistrationStore((state) => state.draft.opcNominee);
  const setOpcNominee = useCompanyRegistrationStore((state) => state.setOpcNominee);
  const addDirector = useCompanyRegistrationStore((state) => state.addDirector);
  const updateDirector = useCompanyRegistrationStore((state) => state.updateDirector);
  const removeDirector = useCompanyRegistrationStore((state) => state.removeDirector);
  const fieldErrors = useCompanyRegistrationStore((state) => state.fieldErrors);
  const setFieldErrors = useCompanyRegistrationStore((state) => state.setFieldErrors);

  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) {
      const next = { ...fieldErrors };
      delete next[key];
      setFieldErrors(next);
    }
  };

  const [expandedDirectorId, setExpandedDirectorId] = useState<string | null>(
    directors.length > 0 ? directors[0].id : null
  );

  const [deletingDirector, setDeletingDirector] = useState<DirectorInfo | null>(null);

  const isOpc = isOpcCompanyType(company.companyType);
  const minRequiredDirectors = getMinRequiredPromoters(company.companyType);

  // Auto-recalculate total subscribed shares & individual percentage
  const totalSubscribedShares = directors.reduce(
    (sum, d) => sum + (Number(d.numberOfShares) || 0),
    0
  );

  const getShareholdingPct = (shares: number | undefined): string => {
    if (isOpc) return '100%';
    if (!shares || !totalSubscribedShares || totalSubscribedShares <= 0) return '0%';
    const pct = (Number(shares) / totalSubscribedShares) * 100;
    if (isNaN(pct)) return '0%';
    return pct % 1 === 0 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`;
  };

  const handleAddPromoter = () => {
    const newId = `dir-${Date.now()}`;
    addDirector({
      id: newId,
      name: '',
      pan: '',
      dob: '',
      fatherName: '',
      gender: '',
      nationality: '',
      occupation: '',
      educationalQualification: '',
      designation: '',
      category: '',
      email: '',
      phone: '',
      isResidentInIndia: true,
      sameAsPermanentAddress: true,
      numberOfShares: 0,
      amountSubscribed: 0,
    });
    setExpandedDirectorId(newId);
  };

  const handleSaveDirector = (id: string, updatedFields: Partial<DirectorInfo>) => {
    updateDirector(id, updatedFields);
    setExpandedDirectorId(null);
  };

  const handleConfirmDelete = () => {
    if (deletingDirector) {
      removeDirector(deletingDirector.id);
      setDeletingDirector(null);
    }
  };

  const handleNomineeChange = (key: keyof OpcNomineeInfo, val: string, validator?: (v: string) => string | null) => {
    setOpcNominee({ ...opcNominee, [key]: val } as any);
    if (validator && !validator(val)) clearFieldError(`nominee_${key}`);
  };

  const handleNomineeBlur = (key: keyof OpcNomineeInfo, validator: (v: string) => string | null) => {
    const raw = (opcNominee?.[key] as string) || '';
    const trimmed = raw.trim();
    if (trimmed !== raw) setOpcNominee({ ...opcNominee, [key]: trimmed } as any);
    const err = validator(trimmed);
    if (err) {
      setFieldErrors({ ...fieldErrors, [`nominee_${key}`]: err });
    } else {
      clearFieldError(`nominee_${key}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionIconBox}>
          <Ionicons name="people-outline" size={18} color="#FF8A00" />
        </View>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.heading}>Promoter / Director Details</Text>
          <Text style={styles.subheading}>
            Enter essential details of all promoters/directors for CA processing.
          </Text>
        </View>
      </View>

      {!isOpc && (
        <>
          {!!fieldErrors.directorsCount && (
            <Text style={[styles.errorText, { marginBottom: 12 }]}>{fieldErrors.directorsCount}</Text>
          )}

          {directors.map((director, idx) => (
            <PromoterDirectorCard
              key={director.id}
              director={director}
              index={idx}
              isExpanded={expandedDirectorId === director.id}
              canRemove={directors.length > minRequiredDirectors}
              shareholdingPct={getShareholdingPct(director.numberOfShares)}
              onToggleExpand={() =>
                setExpandedDirectorId(expandedDirectorId === director.id ? null : director.id)
              }
              onSave={(updatedFields) => handleSaveDirector(director.id, updatedFields)}
              onDeleteRequest={() => setDeletingDirector(director)}
            />
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={handleAddPromoter} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={20} color="#083B75" />
            <Text style={styles.addBtnText}>+ Add Promoter / Director</Text>
          </TouchableOpacity>
        </>
      )}

      {isOpc && (
        <View style={[styles.card, { marginTop: 8 }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.avatarBox}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#FF8A00" />
              </View>
              <View style={styles.cardTitleGroup}>
                <Text style={styles.cardTitle}>OPC Nominee Details *</Text>
                <Text style={styles.cardSubtitle}>
                  Mandatory under Companies Act §3(1)(c) for sole member succession
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nominee Full Name (as in PAN) *</Text>
              <TextInput
                style={[styles.input, !!fieldErrors.nominee_name && styles.inputError]}
                value={opcNominee?.name || ''}
                onChangeText={(v) => handleNomineeChange('name', v, (val) => validatePersonName(val, true, 'Nominee full name'))}
                onBlur={() => handleNomineeBlur('name', (val) => validatePersonName(val, true, 'Nominee full name'))}
                placeholder="Enter nominee's full legal name"
                placeholderTextColor="#94A3B8"
                maxLength={100}
              />
              {!!fieldErrors.nominee_name && (
                <Text style={styles.errorText}>{fieldErrors.nominee_name}</Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.label}>Nominee PAN *</Text>
                <TextInput
                  style={[styles.input, !!fieldErrors.nominee_pan && styles.inputError]}
                  value={opcNominee?.pan || ''}
                  onChangeText={(v) => handleNomineeChange('pan', v.toUpperCase(), validateDirectorPan)}
                  onBlur={() => handleNomineeBlur('pan', validateDirectorPan)}
                  placeholder="ABCDE1234F"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  maxLength={10}
                />
                {!!fieldErrors.nominee_pan && (
                  <Text style={styles.errorText}>{fieldErrors.nominee_pan}</Text>
                )}
              </View>

              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.label}>Relationship</Text>
                <TextInput
                  style={[styles.input, !!fieldErrors.nominee_relationship && styles.inputError]}
                  value={opcNominee?.relationship || ''}
                  onChangeText={(v) => handleNomineeChange('relationship', v, validateNomineeRelationship)}
                  onBlur={() => handleNomineeBlur('relationship', validateNomineeRelationship)}
                  placeholder="e.g. Spouse / Brother"
                  placeholderTextColor="#94A3B8"
                  maxLength={50}
                />
                {!!fieldErrors.nominee_relationship && (
                  <Text style={styles.errorText}>{fieldErrors.nominee_relationship}</Text>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.label}>Nominee Email *</Text>
                <TextInput
                  style={[styles.input, !!fieldErrors.nominee_email && styles.inputError]}
                  value={opcNominee?.email || ''}
                  onChangeText={(v) => handleNomineeChange('email', v, validateDirectorEmail)}
                  onBlur={() => handleNomineeBlur('email', validateDirectorEmail)}
                  placeholder="nominee@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  maxLength={254}
                />
                {!!fieldErrors.nominee_email && (
                  <Text style={styles.errorText}>{fieldErrors.nominee_email}</Text>
                )}
              </View>

              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.label}>Nominee Mobile *</Text>
                <TextInput
                  style={[styles.input, !!fieldErrors.nominee_phone && styles.inputError]}
                  value={opcNominee?.phone || ''}
                  onChangeText={(v) => handleNomineeChange('phone', v, validateDirectorMobile)}
                  onBlur={() => handleNomineeBlur('phone', validateDirectorMobile)}
                  placeholder="10-digit mobile"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
                {!!fieldErrors.nominee_phone && (
                  <Text style={styles.errorText}>{fieldErrors.nominee_phone}</Text>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.label}>Nominee DOB (DD-MM-YYYY) *</Text>
                <TextInput
                  style={[styles.input, !!fieldErrors.nominee_dob && styles.inputError]}
                  value={opcNominee?.dob || ''}
                  onChangeText={(v) => {
                    const cleaned = v.replace(/[^\d-]/g, '').slice(0, 10);
                    handleNomineeChange('dob', cleaned);
                  }}
                  onBlur={() => handleNomineeBlur('dob', (v) => (!v?.trim() ? 'Date of birth is required.' : null))}
                  placeholder="15-08-1995"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={10}
                />
                {!!fieldErrors.nominee_dob && (
                  <Text style={styles.errorText}>{fieldErrors.nominee_dob}</Text>
                )}
              </View>

              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.label}>Nominee Aadhaar (Optional)</Text>
                <TextInput
                  style={[styles.input, !!fieldErrors.nominee_aadhaar && styles.inputError]}
                  value={opcNominee?.aadhaar || ''}
                  onChangeText={(v) => handleNomineeChange('aadhaar', v, validateNomineeAadhaar)}
                  onBlur={() => handleNomineeBlur('aadhaar', validateNomineeAadhaar)}
                  placeholder="12-digit Aadhaar"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={12}
                />
                {!!fieldErrors.nominee_aadhaar && (
                  <Text style={styles.errorText}>{fieldErrors.nominee_aadhaar}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteDirectorModal
        visible={!!deletingDirector}
        directorName={deletingDirector?.name || ''}
        onCancel={() => setDeletingDirector(null)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
};
