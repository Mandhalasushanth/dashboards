package com.taxedge.security.otps.helper;


import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.taxedge.security.otps.exception.OtpRateLimitException;

import lombok.extern.slf4j.Slf4j;


@Slf4j
@Component
public class OtpRateLimiter {

    private static final int MAX_SENDS_PER_WINDOW = 3;
    private static final Duration WINDOW = Duration.ofMinutes(5);
    private static final Duration COOLDOWN = Duration.ofSeconds(60);

    private final Map<String, Deque<Instant>> sends = new ConcurrentHashMap<>();

    
    public void checkAndRecord(String e164Number) {

        Instant now = Instant.now();

        sends.compute(e164Number, (number, history) -> {

            Deque<Instant> timestamps = (history == null) ? new ArrayDeque<>() : history;

            while (!timestamps.isEmpty()
                    && timestamps.peekFirst().isBefore(now.minus(WINDOW))) {
                timestamps.pollFirst();
            }

            Instant last = timestamps.peekLast();
            if (last != null && last.isAfter(now.minus(COOLDOWN))) {
                throw new OtpRateLimitException(
                        "Please wait a minute before requesting another code.");
            }

            if (timestamps.size() >= MAX_SENDS_PER_WINDOW) {
                throw new OtpRateLimitException(
                        "Too many verification attempts. Please try again after 5 minutes.");
            }

            timestamps.addLast(now);
            return timestamps;
        });
    }

  
    @Scheduled(fixedDelay = 15, timeUnit = java.util.concurrent.TimeUnit.MINUTES)
    void purgeExpired() {
        Instant cutoff = Instant.now().minus(WINDOW);
        int before = sends.size();
        sends.entrySet().removeIf(entry ->
                entry.getValue().isEmpty() || entry.getValue().peekLast().isBefore(cutoff));
        log.debug("OTP rate limiter purge: {} → {} tracked numbers", before, sends.size());
    }
}