package com.taxedge.dashboards.camanagers.companyregistration.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.companyregistration.entity.CompanyDetails;
import com.taxedge.companyregistration.entity.PromoterDirectorDetails;
import com.taxedge.companyregistration.entity.RegisteredOfficeDetails;
import com.taxedge.companyregistration.entity.ShareholdingCapital;
import com.taxedge.companyregistration.entity.ShareholdingPattern;
import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.camanagers.companyregistration.dto.CompanyRegistrationDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;

/**
 * Maps each company registration table to its part of the dashboard DTO. The parts live in separate tables
 * that point at the company, so the service loads them and puts one registration together.
 */
@Mapper(componentModel = "spring")
public interface CompanyRegistrationDetailsMapper {

    @Mapping(target = "customerId", source = "custId")
    CustomerDetailsDto toCustomerDetailsDto(Customer customer);

    /** Company details and customer; office, directors, capital and documents are set by the service. */
    @Mapping(target = "registeredOffice", ignore = true)
    @Mapping(target = "directors", ignore = true)
    @Mapping(target = "shareholdingCapital", ignore = true)
    @Mapping(target = "shareholdingPattern", ignore = true)
    @Mapping(target = "documentId", ignore = true)
    @Mapping(target = "panCard", ignore = true)
    @Mapping(target = "identityAddressProof", ignore = true)
    @Mapping(target = "passportPhoto", ignore = true)
    @Mapping(target = "officeAddressProof", ignore = true)
    @Mapping(target = "officeUtilityBill", ignore = true)
    @Mapping(target = "ownerNoc", ignore = true)
    @Mapping(target = "statutoryDocuments", ignore = true)
    @Mapping(target = "aoaEAoa", ignore = true)
    CompanyRegistrationDetailsDto toDto(CompanyDetails entity);

    CompanyRegistrationDetailsDto.RegisteredOffice toRegisteredOffice(RegisteredOfficeDetails entity);

    CompanyRegistrationDetailsDto.Director toDirector(PromoterDirectorDetails entity);

    List<CompanyRegistrationDetailsDto.Director> toDirectors(List<PromoterDirectorDetails> entities);

    CompanyRegistrationDetailsDto.Capital toCapital(ShareholdingCapital entity);

    @Mapping(target = "promoterDirectorId", source = "promoterDirectorDetails.promoterDirectorId")
    @Mapping(target = "directorName", source = "promoterDirectorDetails.fullName")
    CompanyRegistrationDetailsDto.ShareAllocation toShareAllocation(ShareholdingPattern entity);

    List<CompanyRegistrationDetailsDto.ShareAllocation> toShareAllocations(List<ShareholdingPattern> entities);
}
