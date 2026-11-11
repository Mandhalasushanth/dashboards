package com.taxedge.gst.registration.dto;

import java.time.LocalDate;

import com.taxedge.gst.registration.enums.AccountType;
import com.taxedge.gst.registration.enums.CompositionScheme;
import com.taxedge.gst.registration.enums.ConstitutionOfBusiness;
import com.taxedge.gst.registration.enums.NatureOfBusiness;
import com.taxedge.gst.registration.enums.PlaceOfBusiness;
import com.taxedge.gst.registration.enums.ReasonForRegistration;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessResponse {

    private String gstId;

    private String customerId;

    private String legalName;

    private String tradeName;

    private ConstitutionOfBusiness constitutionOfBusiness;

    private NatureOfBusiness natureOfBusiness;

    private LocalDate dateOfCommencement;

    private String businessPan;

    private ReasonForRegistration reasonForRegistration;

    private CompositionScheme compositionScheme;

    private PlaceOfBusiness placeOfBusiness;

    private String businessAddress;

    private String city;

    private String district;

    private String state;

    private String pinCode;

    private String hsnSac;

    private String accountHolderName;

    private String bankAccountNumber;

    private String ifscCode;

    private String bankName;

    private String branchName;

    private AccountType accountType;

    private String authorisedSignatory;

    private String signatoryName;

    private String signatoryPan;

    private LocalDate signatoryDob;

    private String designation;

    private String signatoryMobile;

    private String signatoryEmail;

    private RegisterationStatus status;
}
