package com.taxedge.loan.vehicleloan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleLoanDocumentResponseDto {

    private String vehicleLoanDocumentId;
    private String vehicleLoanId;

    private Boolean vehicleQuotationUploaded;
    private Boolean bookingReceiptUploaded;
    private Boolean rcCopyUploaded;
}
