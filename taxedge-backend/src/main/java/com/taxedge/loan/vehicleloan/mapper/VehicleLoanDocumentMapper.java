package com.taxedge.loan.vehicleloan.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.loan.vehicleloan.dto.VehicleLoanDocumentResponseDto;
import com.taxedge.loan.vehicleloan.entity.VehicleLoanDocument;

@Mapper(componentModel = "spring")
public interface VehicleLoanDocumentMapper {

    @Mapping(
            target = "vehicleLoanId",
            source = "vehicleLoanApplication.vehicleLoanId"
    )
    @Mapping(
            target = "vehicleQuotationUploaded",
            expression = "java(document.getVehicleQuotation() != null && document.getVehicleQuotation().length > 0)"
    )
    @Mapping(
            target = "bookingReceiptUploaded",
            expression = "java(document.getBookingReceipt() != null && document.getBookingReceipt().length > 0)"
    )
    @Mapping(
            target = "rcCopyUploaded",
            expression = "java(document.getRcCopy() != null && document.getRcCopy().length > 0)"
    )
    VehicleLoanDocumentResponseDto toResponseDto(VehicleLoanDocument document);
}
