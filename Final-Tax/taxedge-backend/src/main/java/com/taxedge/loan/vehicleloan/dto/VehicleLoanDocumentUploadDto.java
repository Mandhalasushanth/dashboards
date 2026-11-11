package com.taxedge.loan.vehicleloan.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VehicleLoanDocumentUploadDto {

    private MultipartFile vehicleQuotation;

    private MultipartFile bookingReceipt;

    private MultipartFile rcCopy;

    public java.util.Map<String, MultipartFile> toMap() {
        java.util.Map<String, MultipartFile> map = new java.util.HashMap<>();
        if (vehicleQuotation != null && !vehicleQuotation.isEmpty()) map.put("VEHICLE_QUOTATION", vehicleQuotation);
        if (bookingReceipt != null && !bookingReceipt.isEmpty()) map.put("BOOKING_RECEIPT", bookingReceipt);
        if (rcCopy != null && !rcCopy.isEmpty()) map.put("RC_COPY", rcCopy);
        return map;
    }
}