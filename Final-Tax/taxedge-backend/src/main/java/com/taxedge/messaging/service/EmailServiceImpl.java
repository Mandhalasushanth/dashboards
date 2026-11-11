package com.taxedge.messaging.service;



import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService{

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${taxedge.mail.from}")
    private String from;

    @Value("${taxedge.mail.from-name}")
    private String fromName;

    @Async("mailExecutor")
    public void sendWelcomeEmail(String toEmail, String name, String custId) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Welcome email skipped: email address is blank for customer [{}]", custId);
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("name", name != null ? name : "Customer");
            context.setVariable("custId", custId);

            String html = templateEngine.process("email/welcome-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            helper.setFrom(from, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to TaxEdge");
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Welcome email sent to customer [{}] ({})", custId, toEmail);

        } catch (Exception ex) {
            log.error("Welcome email failed for customer [{}] ({})", custId, toEmail, ex);
        }
    }

    @Async("mailExecutor")
    @Override
    public void sendRegistrationEmail(String toEmail, String recipientName) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("GST registration confirmation email skipped: email address is blank");
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("name", recipientName != null && !recipientName.isBlank() ? recipientName : "Valued Customer");

            String html = templateEngine.process("email/submit-email", context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            String senderFrom = (from != null && !from.isBlank()) ? from : "noreply@taxedge.com";
            String senderName = (fromName != null && !fromName.isBlank()) ? fromName : "TaxEdge";

            helper.setFrom(senderFrom, senderName);
            helper.setTo(toEmail);
            helper.setSubject("Registration Application Submitted");
            helper.setText(html, true);

            mailSender.send(message);
            log.info("registration confirmation email sent successfully to ({})", toEmail);

        } catch (Exception ex) {
            log.error("Failed to send  registration confirmation email to ({})", toEmail, ex);
        }
    }
}
