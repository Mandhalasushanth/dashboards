package com.taxedge.loan.vehicleloan.service;

import java.util.List;

import com.taxedge.loan.vehicleloan.dto.VehicleLoanDocumentResponseDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanDocumentUploadDto;

public interface VehicleLoanDocumentService {

        VehicleLoanDocumentResponseDto uploadDocument(
                        String vehicleLoanId,
                        VehicleLoanDocumentUploadDto dto);

        List<VehicleLoanDocumentResponseDto> getDocuments(
                        String vehicleLoanId);

        byte[] viewDocument(
                        String vehicleLoanId,
                        String documentType);

        void removeDocument(
                        String vehicleLoanId,
                        String documentType);

        void validateRequiredDocuments(
                        String vehicleLoanId);

        VehicleLoanDocumentResponseDto updateDocuments(
                        String vehicleLoanId,
                        VehicleLoanDocumentUploadDto dto);
}
