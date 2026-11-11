package com.taxedge.loan.config;

import org.slf4j.Logger;

import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class LoanDatabaseInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(LoanDatabaseInitializer.class);
    private final JdbcTemplate jdbcTemplate;

    public LoanDatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        String[] sequences = {
            "property_loan_seq",
            "vehicle_loan_seq",
            "home_loan_seq",
            "personal_loan_seq",
            "business_loan_seq",
            "msme_loan_seq",
            "machinery_loan_seq"
        };

        for (String seq : sequences) {
            try {
                jdbcTemplate.execute("CREATE SEQUENCE IF NOT EXISTS " + seq + " START WITH 1 INCREMENT BY 1");
            } catch (Exception e) {
                log.warn("Could not initialize sequence {}: {}", seq, e.getMessage());
            }
        }
        log.info("Initialized independent loan sequences successfully.");
    }
}
