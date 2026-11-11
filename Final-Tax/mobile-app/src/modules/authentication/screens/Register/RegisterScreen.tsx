import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput,
  TouchableOpacity, BackHandler, StyleSheet, LayoutAnimation,
  Keyboard, Alert, ActivityIndicator,
  type TextInputInstance,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";
import { BrandColors, Colors, Spacing } from "@/shared/theme";
import { BiometricPromptModal } from "@/shared/components/BiometricPromptModal";
import { UniversalDatePicker } from "@/shared/components/UniversalDatePicker";
import { KeyboardAwareScrollView } from "@/shared/components/KeyboardAwareFormLayout";
import { FocusAwareStatusBar } from "@/shared/components/FocusAwareStatusBar";
import { styles } from "./RegisterScreen.styles";
import { useCreateProfile } from "@/components/screens/create-profile/useCreateProfile";
import { FieldLabel, FormField, GenderPickerModal, StatePickerModal } from "@/components/screens/create-profile/CreateProfileModals";
import { PROFILE_FIELD_LIMITS } from "@/shared/validators/profileValidators";
import { CUSTOMER_TYPE_OPTIONS } from "@/components/screens/create-profile/types";

/** Height of the title row, and of the curve below it that must stay clear of the title. */
const HEADER_ROW_HEIGHT = 44;
const HEADER_CURVE_DEPTH = 44;

export function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const otpInputRef = useRef<TextInputInstance>(null);
  const [isOtpFocused, setIsOtpFocused] = useState(false);

  const {
    form, updateForm, handlePanChange, handleDobChange, handleBlur,
    profileErrors, profileLoading, handleProceedToRegistration, handleFinalRegistration,
    handleBack, showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword, agreedToTerms, setAgreedToTerms,
    showAddressLine2, setShowAddressLine2, setFieldOffset,
    scrollRef, nameRef, emailRef, fatherSpouseRef,
    panRef, aadhaarRef, address1Ref, address2Ref, cityRef, pinRef,
    passcodeRef, confirmPasscodeRef,
    showGenderModal, setShowGenderModal, showStateModal, setShowStateModal,
    stateSearchQuery, setStateSearchQuery, showBiometricModal, biometricType,
    handleEnableBiometric, handleNotNowBiometric,
    isPanValid,
    isAadhaarValid,
    isOtpButtonEnabled,
    isAadhaarOtpSent,
    isAadhaarVerified,
    aadhaarOtp,
    aadhaarOtpTimer,
    aadhaarOtpError,
    handleSendAadhaarOtp,
    handleResendAadhaarOtp,
    handleVerifyAadhaarOtp,
    handleAadhaarOtpChange,
    handleResetAadhaarVerification,
    formatOtpTime,
  } = useCreateProfile(currentStep, setCurrentStep);

  useEffect(() => {
    if (isAadhaarOtpSent && !isAadhaarVerified) {
      const t = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 250);
      return () => clearTimeout(t);
    }
  }, [isAadhaarOtpSent, isAadhaarVerified]);

  useEffect(() => {
    const onBack = () => {
      if (currentStep === 2) {
        setCurrentStep(1);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, [currentStep, scrollRef]);

  const yo = (key: string) => ({ onLayout: (e: any) => setFieldOffset(key, e.nativeEvent.layout.y) });
  const ff = (key: string) => ({ onBlur: () => handleBlur(key as any) });

  const handleCustomerTypeSelect = (key: string) => {
    updateForm("customerType", key);
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  // The keyboard gap is added by KeyboardAwareScrollView, measured from what the keyboard covers.
  const scrollBottomPadding = Math.max(insets.bottom + Spacing.xl, 40);
  // The curved header grows with the phone's status bar (notch, Dynamic Island, Android cut-outs), so the
  // title always sits on the dark band, above where the curve dips, on every device.
  const headerTop = Math.max(insets.top + Spacing.xs, Spacing.lg);
  const headerHeight = headerTop + HEADER_ROW_HEIGHT + HEADER_CURVE_DEPTH;

  return (
    <View style={[styles.container, { backgroundColor: BrandColors.BACKGROUND }]}>
      {/* White clock and battery icons on the dark header, on iOS and Android alike. */}
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={[styles.waveHeaderWrapper, { height: headerHeight }]}>
        <Svg height={headerHeight} width="100%" viewBox="0 0 375 125" style={StyleSheet.absoluteFill} preserveAspectRatio="none">
          <Path d="M0,0 L375,0 L375,85 C310,120 230,115 140,95 C60,78 20,92 0,100 Z" fill={BrandColors.PRIMARY_BLUE_DARK} />
          <Path d="M260,0 C295,30 335,46 375,48 L375,0 Z" fill={BrandColors.PRIMARY_ORANGE} />
        </Svg>
        <View style={[styles.waveHeaderContent, { paddingTop: headerTop }]}>
          <View style={styles.headerRow}>
            {currentStep === 2 && (
              <TouchableOpacity activeOpacity={0.7} onPress={handleBack} style={styles.backBtnWhite} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Ionicons name="arrow-back" size={24} color={BrandColors.WHITE} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitleWhite} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>Create Account</Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.profileScroll, { paddingBottom: scrollBottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {currentStep === 1 ? (
          <View style={styles.customerTypeContainer}>
            <Text style={styles.customerTypeHeaderTitle}>Select Account Type</Text>
            {CUSTOMER_TYPE_OPTIONS.map((opt) => {
              const sel = form.customerType === opt.key;
              return (
                <TouchableOpacity key={opt.key} activeOpacity={0.8} onPress={() => handleCustomerTypeSelect(opt.key)}
                  style={[styles.customerTypeCard, sel && styles.customerTypeCardSelected]}>
                  <View style={[styles.cardIconContainer, sel && styles.cardIconContainerSelected]}>
                    <Ionicons name={opt.icon} size={22} color={sel ? BrandColors.PRIMARY_ORANGE : BrandColors.PRIMARY_BLUE} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, sel && styles.cardTitleSelected]}>{opt.title}</Text>
                    <Text style={styles.cardSubtitle}>{opt.subtitle}</Text>
                  </View>
                  <View style={[styles.radioCircle, sel && styles.radioCircleSelected]}>
                    {sel && <Ionicons name="checkmark" size={14} color={BrandColors.WHITE} />}
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              activeOpacity={form.customerType ? 0.85 : 0.6}
              onPress={handleProceedToRegistration}
              style={[styles.submitBtnOrange, !form.customerType && { opacity: 0.55 }]}
            >
              <Text style={styles.submitBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Text style={styles.requiredLegend}>
              Please provide the required details to create your Finsolz account.
            </Text>

            <FormField fieldRef={nameRef} {...yo("name")} label="Full Name" required leftIcon="person-outline"
              value={form.name} onChange={(t) => updateForm("name", t)} {...ff("name")}
              placeholder="Full Name" maxLength={PROFILE_FIELD_LIMITS.fullName} autoCapitalize="words"
              error={profileErrors.name} returnKeyType="next" onSubmit={() => emailRef.current?.focus()} />

            <FormField fieldRef={emailRef} {...yo("email")} label="Email" required leftIcon="mail-outline"
              value={form.email} onChange={(t) => updateForm("email", t)} {...ff("email")}
              placeholder="Email" keyboardType="email-address" autoCapitalize="none" maxLength={PROFILE_FIELD_LIMITS.email}
              error={profileErrors.email} returnKeyType="next"
              onSubmit={() => { Keyboard.dismiss(); setShowGenderModal(true); }} />

            <View style={styles.fieldContainer} {...yo("gender")}>
              <FieldLabel label="Gender" required />
              <TouchableOpacity activeOpacity={0.8} onPress={() => { Keyboard.dismiss(); setShowGenderModal(true); }}
                style={[styles.inputBox, profileErrors.gender ? styles.inputBoxError : styles.inputBoxDefault]}>
                <Ionicons name="transgender-outline" size={20} color={profileErrors.gender ? Colors.error : BrandColors.PRIMARY_ORANGE} style={styles.leftIcon} />
                <Text style={[styles.dropdownText, !form.gender && { color: BrandColors.TEXT_MUTED }]}>{form.gender || "Gender"}</Text>
                <Ionicons name="chevron-down" size={20} color={BrandColors.TEXT_SECONDARY} style={styles.rightIcon} />
              </TouchableOpacity>
              {profileErrors.gender ? <Text style={styles.errorText}>{profileErrors.gender}</Text> : null}
            </View>

            <View {...yo("dob")}>
              <UniversalDatePicker
                label="Date of Birth"
                required
                value={form.dob}
                onChange={(d) => {
                  handleDobChange(d);
                  setTimeout(() => fatherSpouseRef.current?.focus(), 150);
                }}
                error={profileErrors.dob}
                valueFormat="DD-MM-YYYY"
                placeholder="DD-MM-YYYY"
                maximumDate={new Date()}
                initialPickerDate={new Date()}
                iconColor={BrandColors.PRIMARY_ORANGE}
              />
            </View>

            <FormField fieldRef={fatherSpouseRef} {...yo("fatherSpouseName")} label="Father's / Spouse Name" required leftIcon="people-outline"
              value={form.fatherSpouseName} onChange={(t) => updateForm("fatherSpouseName", t)} {...ff("fatherSpouseName")}
              placeholder="Father's / Spouse Name" maxLength={PROFILE_FIELD_LIMITS.fatherSpouseName} autoCapitalize="words"
              error={profileErrors.fatherSpouseName}
              returnKeyType="next" onSubmit={() => panRef.current?.focus()} />

            <FormField fieldRef={panRef} {...yo("pan")} label="PAN Number" required leftIcon="card-outline"
              value={form.pan} onChange={handlePanChange} {...ff("pan")}
              placeholder="PAN Number" autoCapitalize="characters" keyboardType="default" maxLength={10}
              rightElement={
                isPanValid ? (
                  <View style={styles.validTickContainer}>
                    <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                  </View>
                ) : null
              }
              error={profileErrors.pan} returnKeyType="next" onSubmit={() => aadhaarRef.current?.focus()} />

            <FormField fieldRef={aadhaarRef} {...yo("aadhaar")} label="Aadhaar Number" required leftIcon="newspaper-outline"
              value={form.aadhaar} onChange={(t) => updateForm("aadhaar", t.replace(/\D/g, "").slice(0, 12))} {...ff("aadhaar")}
              placeholder="Aadhaar Number" keyboardType="number-pad" maxLength={12}
              editable={!isAadhaarVerified}
              rightElement={
                isAadhaarVerified ? (
                  <View style={styles.aadhaarVerifiedInline}>
                    <Ionicons name="checkmark-circle" size={18} color="#059669" />
                    <Text style={styles.aadhaarVerifiedInlineText}>Verified</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={isOtpButtonEnabled ? 0.8 : 1}
                    onPress={isOtpButtonEnabled ? handleSendAadhaarOtp : undefined}
                    disabled={!isOtpButtonEnabled}
                    style={[
                      styles.sendOtpBtn,
                      !isOtpButtonEnabled && styles.sendOtpBtnDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sendOtpBtnText,
                        !isOtpButtonEnabled && styles.sendOtpBtnTextDisabled,
                      ]}
                    >
                      {isAadhaarOtpSent ? (aadhaarOtpTimer === 0 ? "Resend OTP" : "OTP Sent") : "Send OTP"}
                    </Text>
                  </TouchableOpacity>
                )
              }
              error={profileErrors.aadhaar} returnKeyType="next" onSubmit={() => address1Ref.current?.focus()} />

            {isAadhaarOtpSent && !isAadhaarVerified && (
              <View style={styles.aadhaarOtpSection}>
                <View style={styles.aadhaarOtpHeader}>
                  <View style={styles.aadhaarOtpTitleRow}>
                    <Ionicons name="shield-checkmark" size={18} color={BrandColors.PRIMARY_ORANGE} />
                    <Text style={styles.aadhaarOtpTitle}>Verify Aadhaar OTP</Text>
                  </View>
                  <View style={styles.mockOtpPill}>
                    <Text style={styles.mockOtpPillText}>Mock: 123456</Text>
                  </View>
                </View>

                <Text style={styles.aadhaarOtpSubtitle}>
                  Enter the 6-digit verification code sent for Aadhaar authentication.
                </Text>

                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => otpInputRef.current?.focus()}
                  style={styles.aadhaarOtpBoxesContainer}
                >
                  <TextInput
                    ref={otpInputRef}
                    style={styles.aadhaarOtpHiddenInput}
                    value={aadhaarOtp}
                    onChangeText={handleAadhaarOtpChange}
                    keyboardType="number-pad"
                    maxLength={6}
                    returnKeyType="done"
                    onSubmitEditing={() => handleVerifyAadhaarOtp()}
                    onFocus={() => setIsOtpFocused(true)}
                    onBlur={() => setIsOtpFocused(false)}
                  />
                  {[0, 1, 2, 3, 4, 5].map((idx) => {
                    const digit = aadhaarOtp[idx] || "";
                    const isCurrent = isOtpFocused && (aadhaarOtp.length === idx || (idx === 5 && aadhaarOtp.length === 6));
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.aadhaarOtpBox,
                          isCurrent && styles.aadhaarOtpBoxFocused,
                          Boolean(digit) && styles.aadhaarOtpBoxFilled,
                        ]}
                      >
                        <Text style={styles.aadhaarOtpDigitText}>{digit}</Text>
                      </View>
                    );
                  })}
                </TouchableOpacity>

                {aadhaarOtpError ? (
                  <Text style={styles.aadhaarOtpErrorText}>{aadhaarOtpError}</Text>
                ) : null}

                <View style={styles.aadhaarOtpTimerRow}>
                  {aadhaarOtpTimer > 0 ? (
                    <Text style={styles.aadhaarOtpTimerText}>
                      Resend OTP in{" "}
                      <Text style={styles.aadhaarOtpTimerHighlight}>
                        {formatOtpTime(aadhaarOtpTimer)}
                      </Text>
                    </Text>
                  ) : (
                    <View style={styles.aadhaarOtpExpiredRow}>
                      <Text style={styles.aadhaarOtpTimerText}>OTP expired.</Text>
                      <TouchableOpacity activeOpacity={0.7} onPress={handleResendAadhaarOtp}>
                        <Text style={styles.aadhaarOtpResendLink}>Resend OTP</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleVerifyAadhaarOtp()}
                  disabled={aadhaarOtp.length !== 6}
                  style={[
                    styles.aadhaarOtpVerifyBtn,
                    aadhaarOtp.length !== 6 && styles.aadhaarOtpVerifyBtnDisabled,
                  ]}
                >
                  <Text style={styles.aadhaarOtpVerifyBtnText}>Verify OTP</Text>
                </TouchableOpacity>
              </View>
            )}

            {isAadhaarVerified && (
              <View style={styles.aadhaarVerifiedCard}>
                <View style={styles.aadhaarVerifiedCardLeft}>
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  <Text style={styles.aadhaarVerifiedCardText}>Aadhaar verified successfully</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7} onPress={handleResetAadhaarVerification}>
                  <Text style={styles.aadhaarChangeText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}

            <FormField fieldRef={address1Ref} {...yo("addressLine1")} label="Address Line 1" required
              labelRight={!showAddressLine2 ? (
                <TouchableOpacity activeOpacity={0.7} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setShowAddressLine2(true); setTimeout(() => address2Ref.current?.focus(), 150); }}
                  style={styles.addAddressLineBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="add" size={16} color={BrandColors.PRIMARY_ORANGE} />
                  <Text style={styles.addAddressLineBtnText}>Add Line 2</Text>
                </TouchableOpacity>
              ) : null}
              leftIcon="home-outline" value={form.addressLine1} onChange={(t) => updateForm("addressLine1", t)} {...ff("addressLine1")}
              placeholder="House / Building / Street" maxLength={PROFILE_FIELD_LIMITS.addressLine} error={profileErrors.addressLine1} returnKeyType="next"
              onSubmit={() => showAddressLine2 ? address2Ref.current?.focus() : cityRef.current?.focus()} />

            {showAddressLine2 && (
              <FormField fieldRef={address2Ref} label="Address Line 2 (Optional)" leftIcon="location-outline"
                value={form.addressLine2} onChange={(t) => updateForm("addressLine2", t)} {...ff("addressLine2")}
                placeholder="Locality, Landmark" maxLength={PROFILE_FIELD_LIMITS.addressLine} error={profileErrors.addressLine2} returnKeyType="next" onSubmit={() => cityRef.current?.focus()} />
            )}

            <View style={styles.cityPinRow} onLayout={(e) => { setFieldOffset("city", e.nativeEvent.layout.y); setFieldOffset("pincode", e.nativeEvent.layout.y); }}>
              <View style={styles.cityCol}>
                <FormField fieldRef={cityRef} label="City" required leftIcon="business-outline"
                  value={form.city} onChange={(t) => updateForm("city", t)} {...ff("city")}
                  placeholder="City" maxLength={PROFILE_FIELD_LIMITS.city} autoCapitalize="words" error={profileErrors.city} returnKeyType="next" onSubmit={() => pinRef.current?.focus()} />
              </View>
              <View style={styles.pinCol}>
                <FormField fieldRef={pinRef} label="PIN Code" required leftIcon="pin-outline"
                  value={form.pincode} onChange={(t) => updateForm("pincode", t.replace(/\D/g, "").slice(0, 6))} {...ff("pincode")}
                  placeholder="PIN Code" keyboardType="number-pad" maxLength={6}
                  error={profileErrors.pincode} returnKeyType="next"
                  onSubmit={() => { Keyboard.dismiss(); setStateSearchQuery(""); setShowStateModal(true); }} />
              </View>
            </View>

            <View style={styles.fieldContainer} onLayout={(e) => setFieldOffset("state", e.nativeEvent.layout.y)}>
              <FieldLabel label="State / UT" required />
              <TouchableOpacity activeOpacity={0.8} onPress={() => { Keyboard.dismiss(); setStateSearchQuery(""); setShowStateModal(true); }}
                style={[styles.inputBox, profileErrors.state ? styles.inputBoxError : styles.inputBoxDefault]}>
                <Ionicons name="map-outline" size={20} color={profileErrors.state ? Colors.error : BrandColors.PRIMARY_ORANGE} style={styles.leftIcon} />
                <Text style={[styles.dropdownText, !form.state && { color: BrandColors.TEXT_MUTED }]}>{form.state || "State / UT"}</Text>
                <Ionicons name="chevron-down" size={20} color={BrandColors.TEXT_SECONDARY} style={styles.rightIcon} />
              </TouchableOpacity>
              {profileErrors.state ? <Text style={styles.errorText}>{profileErrors.state}</Text> : null}
            </View>
            <FormField fieldRef={passcodeRef} {...yo("password")} label="Passcode" required leftIcon="lock-closed-outline"
              value={form.password} onChange={(t) => updateForm("password", t.replace(/\D/g, "").slice(0, 6))} {...ff("password")}
              placeholder="Passcode" keyboardType="number-pad" maxLength={6} secure={!showPassword}
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"} onRightIcon={() => setShowPassword((p) => !p)}
              error={profileErrors.password} returnKeyType="next" onSubmit={() => confirmPasscodeRef.current?.focus()} />

            <FormField fieldRef={confirmPasscodeRef} {...yo("confirmPassword")} label="Confirm Passcode" required leftIcon="lock-closed-outline"
              value={form.confirmPassword} onChange={(t) => updateForm("confirmPassword", t.replace(/\D/g, "").slice(0, 6))} {...ff("confirmPassword")}
              placeholder="Confirm Passcode" keyboardType="number-pad" maxLength={6} secure={!showConfirmPassword}
              rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"} onRightIcon={() => setShowConfirmPassword((p) => !p)}
              error={profileErrors.confirmPassword} returnKeyType="done" onSubmit={() => Keyboard.dismiss()} />

            <View style={styles.termsRow} onLayout={(e) => setFieldOffset("terms", e.nativeEvent.layout.y)}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setAgreedToTerms((p) => !p)}
                style={[styles.checkbox, agreedToTerms && styles.checkboxChecked, profileErrors.terms ? { borderColor: Colors.error, borderWidth: 2 } : null]}>
                {agreedToTerms && <Ionicons name="checkmark" size={16} color={BrandColors.WHITE} />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                By creating an account, I agree to the{" "}
                <Text style={styles.termsLink} onPress={() => Alert.alert("Terms of Service", "By using Finsolz, you agree to statutory Indian tax filing and compliance guidelines, confidential credential management, and authorized tax representation.")}>
                  Terms of Service
                </Text>{" "}and{" "}
                <Text style={styles.termsLink} onPress={() => Alert.alert("Privacy Policy", "Finsolz uses bank-grade 256-bit encryption to safeguard your PAN, Aadhaar, and financial records. We do not sell your data to third parties.")}>
                  Privacy Policy
                </Text>.
              </Text>
            </View>
            {profileErrors.terms && <Text style={[styles.errorText, styles.termsErrorText]}>{profileErrors.terms}</Text>}

            <TouchableOpacity activeOpacity={0.85} onPress={handleFinalRegistration} disabled={profileLoading}
              style={[styles.submitBtnOrange, profileLoading && styles.submitBtnDisabled]}>
              {profileLoading ? <ActivityIndicator color={BrandColors.WHITE} size="small" /> : <Text style={styles.submitBtnText}>Create Account</Text>}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>

      <GenderPickerModal visible={showGenderModal} selectedGender={form.gender}
        onSelect={(g) => { updateForm("gender", g); setShowGenderModal(false); }}
        onClose={() => setShowGenderModal(false)} />

      <StatePickerModal visible={showStateModal} selectedState={form.state}
        searchQuery={stateSearchQuery} onSearchChange={setStateSearchQuery}
        onSelect={(s) => { updateForm("state", s); setShowStateModal(false); setTimeout(() => passcodeRef.current?.focus(), 150); }}
        onClose={() => setShowStateModal(false)} />

      <BiometricPromptModal visible={showBiometricModal} biometricType={biometricType}
        onEnable={handleEnableBiometric} onNotNow={handleNotNowBiometric} />
    </View>
  );
}

export default RegisterScreen;
