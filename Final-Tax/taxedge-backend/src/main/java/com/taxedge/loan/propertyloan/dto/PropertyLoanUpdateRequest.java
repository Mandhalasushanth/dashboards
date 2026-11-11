package com.taxedge.loan.propertyloan.dto;

import java.math.BigDecimal;

import com.taxedge.loan.propertyloan.enums.ConstructionStage;
import com.taxedge.loan.propertyloan.enums.PropertyLoanPurpose;
import com.taxedge.loan.propertyloan.enums.PropertyOwnership;
import com.taxedge.loan.propertyloan.enums.PropertyStatus;
import com.taxedge.loan.propertyloan.enums.PropertyType;
import com.taxedge.loan.propertyloan.enums.RenovationStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyLoanUpdateRequest {

    private BigDecimal requestedLoanAmount;
    private PropertyLoanPurpose purposeOfLoan;
    private String purposeOther;

    private PropertyStatus propertyStatus;
    private ConstructionStage constructionStage;
    private RenovationStatus renovationStatus;

    private PropertyType propertyType;
    private String city;
    private String state;
    private String pinCode;
    private PropertyOwnership ownership;
}
