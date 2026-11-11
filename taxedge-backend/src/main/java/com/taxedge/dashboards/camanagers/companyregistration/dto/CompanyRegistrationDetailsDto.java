package com.taxedge.dashboards.camanagers.companyregistration.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One company registration as the CA manager and agent dashboards show it: the customer, every step of the
 * registration form and the uploaded KYC documents, in a single record (the same shape as the GST and ITR
 * dashboard DTOs).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRegistrationDetailsDto {

    // Common Customer Details
    private CustomerDetailsDto customer;

    // Step 1: Company Details
    private String companyRegistrationId;
    private String categoryOfCompany;
    private String subCategoryOfCompany;
    private String proposedCompanyName;
    private String alternativeProposedName;
    private String primaryBusinessActivity;
    private String nic5DigitCode;
    private String secondaryActivity;
    private String companyStructure;

    // Step 2: Registered Office
    private RegisteredOffice registeredOffice;

    // Step 3: Promoters / Directors
    private List<Director> directors;

    // Step 4: Shareholding & Capital
    private Capital shareholdingCapital;
    private List<ShareAllocation> shareholdingPattern;

    // Step 5: Documents & KYC
    private String documentId;
    private byte[] panCard;
    private byte[] identityAddressProof;
    private byte[] passportPhoto;
    private byte[] officeAddressProof;
    private byte[] officeUtilityBill;
    private byte[] ownerNoc;
    private byte[] statutoryDocuments;
    private byte[] aoaEAoa;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisteredOffice {
        private String registeredOfficeId;
        private String buildingPremisesAddressLine;
        private String city;
        private String district;
        private String state;
        private String pinCode;
        private String premisesOwnership;
        private String companyEmail;
        private String mobileNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Director {
        private String promoterDirectorId;
        private String fullName;
        private String panNumber;
        private LocalDate dateOfBirth;
        private String designation;
        private String emailAddress;
        private String mobileNumber;
        private String din;
        private String relationship;
        private String aadhaarNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Capital {
        private String shareholdingCapitalId;
        private BigDecimal authorisedCapital;
        private BigDecimal faceValuePerShare;
        private Long authorisedShares;
        private BigDecimal subscribedCapital;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareAllocation {
        private String shareholdingPatternId;
        private String promoterDirectorId;
        private String directorName;
        private Long allocatedShares;
        private BigDecimal amount;
    }
}
