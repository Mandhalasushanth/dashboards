package com.taxedge.security.otps.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.taxedge.security.otps.exception.OtpDeliveryException;
import com.taxedge.security.otps.helper.OtpHelper;
import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class TwilioOtpServiceImpl implements OtpServices {

    private static final String CHANNEL = "sms";
    private static final String APPROVED = "approved";

    private static final int ERR_MAX_SEND_ATTEMPTS = 60203;
    private static final int ERR_MAX_CHECK_ATTEMPTS = 60202;
    private static final int ERR_UNVERIFIED_NUMBER = 21608;
    private static final int ERR_NOT_FOUND = 20404;

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.api-key:}")
    private String apiKey;

    @Value("${twilio.api-secret:}")
    private String apiSecret;

    @Value("${twilio.verify-service-sid:}")
    private String verifyServiceSid;

    @Value("${otp.test-mode.enabled:false}")
    private boolean testModeEnabled;

    @Value("${otp.test-mode.numbers:}")
    private String testNumbersRaw;

    @Value("${otp.test-mode.default-code:123456}")
    private String defaultOtpCode;

    private volatile boolean initialized = false;

    @PostConstruct
    void validateAndInitialize() {
        if (testModeEnabled) {
            log.info("OTP Test Mode is ENABLED. Configured test numbers will bypass Twilio.");
        }

        if (isConfigured()) {
            Twilio.init(apiKey, apiSecret, accountSid);
            initialized = true;
            log.info("Twilio initialized successfully for Verify Service");
        } else {
            log.warn("Twilio configuration is incomplete. Set TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET, and TWILIO_VERIFY_SERVICE_SID in your .env");
        }
    }

    private boolean isConfigured() {
        return accountSid != null && !accountSid.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank()
                && verifyServiceSid != null && !verifyServiceSid.isBlank();
    }

    private void ensureInitialized() {
        if (!initialized) {
            synchronized (this) {
                if (!initialized) {
                    if (isConfigured()) {
                        Twilio.init(apiKey, apiSecret, accountSid);
                        initialized = true;
                    } else {
                        throw new IllegalStateException("Twilio is not configured. Please set Twilio credentials in your .env file.");
                    }
                }
            }
        }
    }

    private boolean isTestNumber(String mobileNumber) {
        if (!testModeEnabled || testNumbersRaw == null || testNumbersRaw.isBlank() || mobileNumber == null) {
            return false;
        }
        String inputNational = OtpHelper.extractNationalNumber(mobileNumber);
        String[] numbers = testNumbersRaw.split(",");
        for (String testNum : numbers) {
            String testNational = OtpHelper.extractNationalNumber(testNum.trim());
            if (!testNational.isEmpty() && testNational.equals(inputNational)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public void sendOtp(String mobileNumber) {
        if (isTestNumber(mobileNumber)) {
            log.info("[TEST MODE] Mock OTP dispatched for test number: {}", OtpHelper.mask(mobileNumber));
            return;
        }

        ensureInitialized();

        String to = OtpHelper.toE164(mobileNumber);

        try {
            Verification verification = Verification
                    .creator(verifyServiceSid, to, CHANNEL)
                    .create();

            log.info("OTP dispatched to {}: status={}, sid={}",
                    OtpHelper.mask(to), verification.getStatus(), verification.getSid());

        } catch (ApiException ex) {
            log.error("Twilio send failed for {}: code={}, message={}",
                    OtpHelper.mask(to), ex.getCode(), ex.getMessage());
            throw new OtpDeliveryException(buildDeliveryErrorMessage(ex), ex);
        }
    }

    @Override
    public boolean verifyOtp(String mobileNumber, String code) {
        if (isTestNumber(mobileNumber)) {
            String normalisedCode = OtpHelper.normaliseCode(code);
            String expectedCode = defaultOtpCode != null ? defaultOtpCode.trim() : "123456";
            boolean matches = expectedCode.equals(normalisedCode);
            log.info("[TEST MODE] Mock OTP verification for {}: result={}",
                    OtpHelper.mask(mobileNumber), matches);
            return matches;
        }

        ensureInitialized();

        String to = OtpHelper.toE164(mobileNumber);
        String normalisedCode = OtpHelper.normaliseCode(code);

        try {
            VerificationCheck check = VerificationCheck
                    .creator(verifyServiceSid)
                    .setTo(to)
                    .setCode(normalisedCode)
                    .create();

            boolean approved = APPROVED.equalsIgnoreCase(check.getStatus());
            log.info("OTP check for {}: status={}, approved={}",
                    OtpHelper.mask(to), check.getStatus(), approved);

            return approved;

        } catch (ApiException ex) {
            if (ex.getCode() != null) {
                if (ex.getCode() == ERR_NOT_FOUND) {
                    log.info("OTP check for {}: expired or not found", OtpHelper.mask(to));
                    return false;
                }
                if (ex.getCode() == ERR_MAX_CHECK_ATTEMPTS) {
                    log.warn("OTP check for {}: max check attempts reached", OtpHelper.mask(to));
                    return false;
                }
            }
            log.warn("Twilio verify check failed for {}: code={}, message={}",
                    OtpHelper.mask(to), ex.getCode(), ex.getMessage());
            return false;
        }
    }

    private String buildDeliveryErrorMessage(ApiException ex) {
        if (ex.getCode() == null) {
            return "Could not send the verification code. Please try again.";
        }
        return switch (ex.getCode()) {
            case ERR_MAX_SEND_ATTEMPTS ->
                    "Too many verification attempts for this number. Please try again later.";
            case ERR_UNVERIFIED_NUMBER ->
                    "This number is not permitted on the current Twilio plan.";
            default ->
                    "Could not send the verification code: " + ex.getMessage();
        };
    }
}
