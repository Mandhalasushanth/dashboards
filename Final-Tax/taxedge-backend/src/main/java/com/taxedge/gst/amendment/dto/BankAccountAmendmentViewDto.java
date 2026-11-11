package com.taxedge.gst.amendment.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taxedge.gst.registration.enums.AccountType;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BankAccountAmendmentViewDto {
    private String id;
    private String newBankName;
    private String newBankAccountNumber;
    private String newIfscCode;
    private AccountType newAccountType;
    private byte[] imageData;
    private String businessGstId;
    private String gstNumber;
    private String customerId;

    @Builder.Default
    private RegisterationStatus status = RegisterationStatus.DRAFT;
}
