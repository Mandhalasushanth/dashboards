package com.taxedge.loan.msmeloan.dto;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MsmeLoanSubmissionRequestDto {

    @NotNull
    private JsonNode kycData;

    @NotNull
    @Valid
    private MsmeFormData msmeFormData;

    @Data
    public static class MsmeFormData {
        @NotBlank
        @Size(max = 150)
        private String businessName;

        @NotBlank
        @Pattern(regexp = "Proprietorship|Partnership|Partnership Firm|LLP|Private Limited Company|Public Limited Company|One Person Company|Other")
        private String constitution;

        @Size(max = 50)
        private String constitutionOther;

        @NotBlank
        @Pattern(regexp = "Manufacturing|Service|Service Provider|Trading|Wholesale Trading|Retail Trading|IT / Software Services|Food & Agro Processing|Textiles & Apparel|Automotive & Engineering|Other")
        private String businessActivity;

        @Size(max = 60)
        private String businessActivityOther;

        @NotBlank
        @Pattern(regexp = "(\\d{4}-\\d{2}-\\d{2}|\\d{2}-\\d{2}-\\d{4})")
        private String establishmentDate;

        @NotNull
        @Valid
        private OperatingAddress operatingAddress;

        @NotBlank
        @Pattern(regexp = "Registered|Not Registered|Applied / Pending|Yes|No")
        private String udyamStatus;

        @Size(max = 30)
        private String udyamRegistrationNumber;

        @NotBlank
        @Pattern(regexp = "Registered|Not Registered|Exempt|Yes|No")
        private String gstStatus;

        @Size(max = 15)
        private String gstin;

        @NotBlank
        @Pattern(regexp = "Less than 1 year|1–3 years|3–5 years|5–10 years|More than 10 years")
        private String operatingDuration;

        @NotBlank
        @Pattern(regexp = "\\d{1,5}")
        private String numberOfEmployees;

        @NotBlank
        @Pattern(regexp = "\\d{1,13}")
        private String annualTurnover;

        @NotBlank
        @Pattern(regexp = "\\d{5,13}")
        private String requestedLoanAmount;

        @NotBlank
        @Pattern(regexp = "Sole Owner|Joint Ownership|Other")
        private String ownershipType;

        @Size(max = 50)
        private String ownershipTypeOther;
    }

    @Data
    public static class OperatingAddress {
        @NotBlank
        @Size(max = 100)
        private String houseNumber;

        @NotBlank
        @Size(max = 120)
        private String street;

        @NotBlank
        @Size(max = 50)
        private String city;

        @NotBlank
        @Size(max = 100)
        private String state;

        @NotBlank
        @Pattern(regexp = "[1-9][0-9]{5}")
        private String pincode;
    }
}
