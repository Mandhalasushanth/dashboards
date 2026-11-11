package com.taxedge.dashboards.camanagers.gst.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.GstRegistrationDetailsDto;
import com.taxedge.gst.registration.entity.Business;

@Mapper(componentModel = "spring")
public interface GstRegistrationDetailsMapper {

    @Mapping(target = "customerId", source = "custId")
    CustomerDetailsDto toCustomerDetailsDto(Customer customer);

    // Document fields
    @Mapping(target = "documentId", source = "documents.documentId")
    @Mapping(target = "principalPlaceAddressType", source = "documents.principalPlaceAddressType")
    @Mapping(target = "panCard", source = "documents.panCard")
    @Mapping(target = "aadhaarCard", source = "documents.aadhaarCard")
    @Mapping(target = "businessRegistrationProof", source = "documents.businessRegistrationProof")
    @Mapping(target = "principalPlaceAddressProof", source = "documents.principalPlaceAddressProof")
    @Mapping(target = "bankPassbookOrCancelledCheque", source = "documents.bankPassbookOrCancelledCheque")
    @Mapping(target = "passportSizePhotograph", source = "documents.passportSizePhotograph")
    GstRegistrationDetailsDto toDto(Business business);

    List<GstRegistrationDetailsDto> toDtoList(List<Business> businesses);
}
