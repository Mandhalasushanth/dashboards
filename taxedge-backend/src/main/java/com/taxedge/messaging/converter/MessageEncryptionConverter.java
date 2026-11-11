package com.taxedge.messaging.converter;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Component
@Converter
public class MessageEncryptionConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96-bit IV recommended for GCM
    private static final int GCM_TAG_LENGTH = 128; // 128-bit authentication tag
    private static final String CIPHER_PREFIX = "ENC::";

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static volatile SecretKey secretKey;

    @Value("${chat.encryption.secret:${jwt.secret}}")
    private String configuredSecret;

    @PostConstruct
    public void init() {
        initKey(configuredSecret);
    }

    public static synchronized void initKey(String secret) {
        if (secret != null && !secret.isBlank()) {
            try {
                // Ensure key is exactly 256 bits (32 bytes)
                byte[] keyBytes = new byte[32];
                byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
                for (int i = 0; i < 32; i++) {
                    keyBytes[i] = (byte) (i < raw.length ? raw[i] : (i * 31));
                }
                secretKey = new SecretKeySpec(keyBytes, "AES");
                log.info("MessageEncryptionConverter initialized with AES-256-GCM");
            } catch (Exception ex) {
                log.error("Failed to initialize AES encryption key: {}", ex.getMessage(), ex);
            }
        }
    }

    @Override
    public String convertToDatabaseColumn(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }

        if (secretKey == null) {
            log.warn("AES secret key not yet initialized. Storing plain text.");
            return plainText;
        }

        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            SECURE_RANDOM.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return CIPHER_PREFIX + Base64.getEncoder().encodeToString(byteBuffer.array());

        } catch (Exception ex) {
            log.error("Error encrypting message content: {}", ex.getMessage(), ex);
            return plainText;
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return dbData;
        }

        // Backward compatibility: If the message was saved before encryption was enabled, return as-is
        if (!dbData.startsWith(CIPHER_PREFIX)) {
            return dbData;
        }

        if (secretKey == null) {
            log.warn("AES secret key not yet initialized. Cannot decrypt message.");
            return dbData;
        }

        try {
            String base64Payload = dbData.substring(CIPHER_PREFIX.length());
            byte[] combined = Base64.getDecoder().decode(base64Payload);

            if (combined.length <= GCM_IV_LENGTH) {
                return dbData;
            }

            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);

            int cipherLength = combined.length - GCM_IV_LENGTH;
            byte[] cipherText = new byte[cipherLength];
            System.arraycopy(combined, GCM_IV_LENGTH, cipherText, 0, cipherLength);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] plainBytes = cipher.doFinal(cipherText);
            return new String(plainBytes, StandardCharsets.UTF_8);

        } catch (Exception ex) {
            log.error("Error decrypting message content: {}", ex.getMessage(), ex);
            return dbData;
        }
    }
}

