import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from '@/shared/components/KeyboardAwareFormLayout';
import { KeyboardStickyFooter } from '@/shared/components/KeyboardStickyFooter';
import { LoanStepIndicator } from '@/shared/components/LoanStepIndicator';
import { UniversalDraftModal } from '@/shared/components/UniversalDraftModal';
import { useCompanyRegistrationStore } from '../../store/companyRegistrationSlice';
import { useCompanyRegistrationDraftGuard } from '../../hooks/useCompanyRegistrationDraftGuard';
import { LinearGradient } from 'expo-linear-gradient';
import { validateRegistrationStep } from '../../validation/companyStepValidation';
import { getErrorMessage } from '@/core/error-handling/errorMessage';
import {
  companyRegistrationApiService,
  extractId,
} from '../../services/CompanyRegistrationApiService';

import { StepCompanyType } from '../../components/steps/StepCompanyType';
import { StepCombinedDetails } from '../../components/steps/StepCombinedDetails';
import { StepRegisteredOffice } from '../../components/steps/StepRegisteredOffice';
import { StepPromoters } from '../../components/steps/StepPromoters';
import { StepCapitalShareholding } from '../../components/steps/StepCapitalShareholding';
import { StepDocumentsKYC } from '../../components/steps/StepDocumentsKYC';
import { StepReviewApplication } from '../../components/steps/StepReviewApplication';
import { StepSubmissionSuccess } from '../../components/steps/StepSubmissionSuccess';

import { styles } from './CompanyRegistrationScreen.styles';

const STEP_NAMES = [
  'Company Structure',
  'Company Details & Names',
  'Registered Office Details',
  'Promoter / Director Details',
  'Shareholding & Capital',
  'Documents & KYC Checklist',
  'Review Application',
  'Submission Success',
];

export const CompanyRegistrationScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const draft = useCompanyRegistrationStore((state) => state.draft);
  const setStep = useCompanyRegistrationStore((state) => state.setStep);
  const editingStep = useCompanyRegistrationStore((state) => state.editingStep);
  const startEditingStep = useCompanyRegistrationStore((state) => state.startEditingStep);
  const clearEditingStep = useCompanyRegistrationStore((state) => state.clearEditingStep);
  const submitRegistrationSuccess = useCompanyRegistrationStore((state) => state.submitRegistrationSuccess);
  const resetRegistration = useCompanyRegistrationStore((state) => state.resetRegistration);

  const {
    showDraftModal,
    openDraftModal,
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancel,
    clearCompanyRegistrationDraft,
  } = useCompanyRegistrationDraftGuard();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = draft.currentStep;
  const totalSteps = STEP_NAMES.length;
  const isEditing = editingStep !== null && editingStep === currentStep;

  useEffect(() => {
    const initialDraftState = useCompanyRegistrationStore.getState().draft;
    if (initialDraftState.status === 'Submitted' || initialDraftState.currentStep === 7) {
      resetRegistration();
    }

    return () => {
      clearEditingStep();
      const currentDraftState = useCompanyRegistrationStore.getState().draft;
      if (currentDraftState.status === 'Submitted' || currentDraftState.currentStep === 7) {
        useCompanyRegistrationStore.getState().resetRegistration();
      }
    };
  }, [clearEditingStep, resetRegistration]);

  const handleHeaderBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
    } else if (draft.company.companyType) {
      openDraftModal();
    } else {
      router.back();
    }
  };

  const setFieldErrors = useCompanyRegistrationStore((state) => state.setFieldErrors);
  const registrationId = useCompanyRegistrationStore((state) => state.registrationId);
  const setRegistrationId = useCompanyRegistrationStore((state) => state.setRegistrationId);
  const registeredOfficeId = useCompanyRegistrationStore((state) => state.registeredOfficeId);
  const setRegisteredOfficeId = useCompanyRegistrationStore((state) => state.setRegisteredOfficeId);

  const handleUpdateAndContinue = async () => {
    if (isSubmitting) return;

    const { valid, fieldErrors } = validateRegistrationStep(currentStep, draft);
    if (!valid) {
      setFieldErrors(fieldErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    try {
      if (registrationId) {
        if (currentStep === 1) {
          await companyRegistrationApiService.updateRegistration(registrationId, draft);
        } else if (currentStep === 2) {
          if (registeredOfficeId) {
            await companyRegistrationApiService.updateRegisteredOffice(registeredOfficeId, draft, registrationId);
          } else {
            const res = await companyRegistrationApiService.saveRegisteredOffice(registrationId, draft);
            const roId = extractId(res);
            if (roId) setRegisteredOfficeId(roId);
          }
        } else if (currentStep === 3) {
          // Check existing promoters count in DB before saving
          const existingPromoters = await companyRegistrationApiService.getPromoters(registrationId);
          const currentCount = draft.directors ? draft.directors.length : 0;
          const countChanged = existingPromoters && existingPromoters.length !== currentCount;

          await companyRegistrationApiService.savePromoters(registrationId, draft);

          // If a director was added or removed, guide the user to Step 4 to allocate/update shares
          if (countChanged) {
            startEditingStep(4);
            setIsSubmitting(false);
            return;
          }
        } else if (currentStep === 4) {
          const promoters = await companyRegistrationApiService.getPromoters(registrationId);
          const pIds = promoters && promoters.length > 0
            ? promoters.map((p) => p.promoterDirectorId).filter(Boolean)
            : [];
          if (pIds.length > 0) {
            await companyRegistrationApiService.saveShareholdingCapital(registrationId, draft, pIds);
          }
        }
      }
      clearEditingStep();
      setStep(6);
    } catch (err: any) {
      Alert.alert('Update Error', getErrorMessage(err) || 'Failed to update section.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isSubmitting) {
      return;
    }

    if (currentStep === 6) {
      const invalidStepIndex = [0, 1, 2, 3, 4, 5].find((s) => {
        const { valid, fieldErrors: errs } = validateRegistrationStep(s, draft);
        if (!valid) {
          setFieldErrors(errs);
          setStep(s);
          Alert.alert('Incomplete Section', 'Please complete all required fields in this step before submitting.');
          return true;
        }
        return false;
      });
      if (invalidStepIndex !== undefined) {
        return;
      }

      if (draft.status === 'Submitted') {
        setStep(7);
        return;
      }

      setFieldErrors({});
      const appId =
        (registrationId ? `CR-${registrationId}` : undefined) ||
        draft.id ||
        `APP-${Date.now().toString().slice(-6)}`;
      submitRegistrationSuccess(appId, 'Submitted');
      clearCompanyRegistrationDraft();
      return;
    }

    console.log(`[handleNext] Step ${currentStep} pressed. Validating...`);
    const { valid, fieldErrors } = validateRegistrationStep(currentStep, draft);
    if (!valid) {
      console.warn(`[handleNext] Validation failed for Step ${currentStep}:`, JSON.stringify(fieldErrors));
      setFieldErrors(fieldErrors);
      Alert.alert('Incomplete Section', 'Please fill all required fields correctly before proceeding.');
      return;
    }

    setFieldErrors({});

    // Normal Step Transition: Sequential POST integration mirroring ITR architecture
    if (currentStep === 1) {
      setIsSubmitting(true);
      try {
        if (!registrationId) {
          const res = await companyRegistrationApiService.createRegistration(draft);
          const newId = extractId(res);
          if (newId) {
            setRegistrationId(newId);
          }
        } else {
          await companyRegistrationApiService.updateRegistration(registrationId, draft);
        }
      } catch (err: any) {
        Alert.alert('Company Registration Error', getErrorMessage(err) || 'Failed to register company details in database.');
        setIsSubmitting(false);
        return;
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 2) {
      setIsSubmitting(true);
      try {
        let activeRegId = registrationId;
        if (!activeRegId) {
          const res = await companyRegistrationApiService.createRegistration(draft);
          activeRegId = extractId(res);
          if (activeRegId) {
            setRegistrationId(activeRegId);
          }
        }
        if (activeRegId) {
          if (!registeredOfficeId) {
            const res = await companyRegistrationApiService.saveRegisteredOffice(activeRegId, draft);
            const roId = extractId(res);
            if (roId) {
              setRegisteredOfficeId(roId);
            }
          } else {
            await companyRegistrationApiService.updateRegisteredOffice(registeredOfficeId, draft, activeRegId);
          }
        }
      } catch (err: any) {
        console.warn('Step 2 office sync info:', getErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        let activeRegId = registrationId;
        if (!activeRegId) {
          const res = await companyRegistrationApiService.createRegistration(draft);
          activeRegId = extractId(res);
          if (activeRegId) setRegistrationId(activeRegId);
        }
        if (activeRegId) {
          console.log(`[handleNext] Saving Step 3 Promoters for registrationId: ${activeRegId}`);
          await companyRegistrationApiService.savePromoters(activeRegId, draft);
        }
      } catch (err: any) {
        console.error('Step 3 promoter save failed:', err);
        Alert.alert('Promoter Details Error', getErrorMessage(err) || 'Failed to save promoter/director details.');
        setIsSubmitting(false);
        return;
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 4) {
      setIsSubmitting(true);
      try {
        if (registrationId) {
          console.log(`[handleNext] Saving Step 4 Shareholding & Capital for registrationId: ${registrationId}`);
          // Fetch backend promoter IDs for this company to link the shareholding pattern
          const promoters = await companyRegistrationApiService.getPromoters(registrationId);
          const pIds = promoters && promoters.length > 0
            ? promoters.map((p) => p.promoterDirectorId).filter(Boolean)
            : [];
          if (pIds.length > 0) {
            await companyRegistrationApiService.saveShareholdingCapital(registrationId, draft, pIds);
          }
        }
      } catch (err: any) {
        console.warn('Step 4 capital sync info:', getErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 5) {
      setIsSubmitting(true);
      try {
        if (registrationId && draft.documents) {
          console.log(`[handleNext] Uploading Step 5 Documents for registrationId: ${registrationId}`);
          const DOCUMENT_ID_TO_BACKEND_PARAM: Record<string, string> = {
            'doc-pan': 'panCard',
            'doc-aadhaar': 'identityAddressProof',
            'doc-photo': 'passportPhoto',
            'doc-address': 'officeAddressProof',
            'doc-utility': 'officeUtilityBill',
            'doc-noc': 'ownerNoc',
            'doc-moa': 'statutoryDocuments',
            'doc-aoa': 'aoaEAoa',
          };

          const fileMap: Record<string, { uri: string; name: string }> = {};
          draft.documents.forEach((doc) => {
            if (doc?.fileUri && doc?.id) {
              const paramName = DOCUMENT_ID_TO_BACKEND_PARAM[doc.id] || doc.id;
              fileMap[paramName] = { uri: doc.fileUri, name: doc.fileName || `${paramName}.pdf` };
            }
          });
          if (Object.keys(fileMap).length > 0) {
            await companyRegistrationApiService.uploadDocuments(registrationId, fileMap);
          }
        }
      } catch (err: any) {
        console.warn('Step 5 documents upload sync info:', getErrorMessage(err));
      } finally {
        setIsSubmitting(false);
      }
    } else if (registrationId) {
      // General safety update for other steps
      companyRegistrationApiService
        .updateRegistration(registrationId, draft)
        .catch((e) => console.warn('Step sync info:', getErrorMessage(e)));
    }

    if (currentStep < totalSteps - 1) {
      setStep(currentStep + 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return <StepCompanyType />;
      case 1: return <StepCombinedDetails />;
      case 2: return <StepRegisteredOffice />;
      case 3: return <StepPromoters />;
      case 4: return <StepCapitalShareholding />;
      case 5: return <StepDocumentsKYC />;
      case 6: return <StepReviewApplication />;
      case 7: return <StepSubmissionSuccess />;
      default: return <StepCompanyType />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Home Loan-style Reusable Header & Progress Bar */}
      <LoanStepIndicator
        variant="linear"
        title="Company Incorporation"
        subtitle={STEP_NAMES[currentStep] || ''}
        currentStepIndex={currentStep}
        totalSteps={totalSteps}
        onBack={currentStep >= 6 || isEditing ? undefined : handleHeaderBack}
        onSettings={() =>
          Alert.alert(
            "Company Incorporation Assistance",
            "Need help with your incorporation application? Contact support@finsolz.in or your assigned compliance officer."
          )
        }
      />

      {/* Main Scroll Content with Keyboard Handling */}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </KeyboardAwareScrollView>

      {/* Sticky Bottom Footer Navigation */}
      {currentStep < 7 && (
        <KeyboardStickyFooter style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16), justifyContent: 'flex-end' }]}>
          {isEditing ? (
            /* Separate Button 1: Update and Continue (Review Edit Mode) */
            <TouchableOpacity
              style={[styles.updateBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleUpdateAndContinue}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF8A00', '#FF5500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.btnContentRow}>
                    <Text style={styles.updateBtnText}>Update and Continue</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={styles.btnIcon} />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            /* Separate Button 2: Continue / Submit (Normal Flow) */
            <TouchableOpacity
              style={[styles.nextBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleNext}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF8A00', '#FF5500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.nextBtnText}>
                    {currentStep === 6 ? 'Submit Application' : 'Continue →'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </KeyboardStickyFooter>
      )}

      <UniversalDraftModal
        visible={showDraftModal}
        title="Save Filing Progress?"
        message="You have unsaved changes in your application. Save your progress so you can resume anytime without re-entering details."
        saveButtonText="Save as Draft & Exit"
        discardButtonText="Discard & Exit"
        cancelButtonText="Keep Editing"
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        onCancel={handleCancel}
      />
    </View>
  );
};

export default CompanyRegistrationScreen;
