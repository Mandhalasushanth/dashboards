package com.taxedge.dashboards.camanagers.gst.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.camanagers.gst.dto.AdditionalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.BankAccountAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.ContactAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.LegalNameAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.PrincipalPlaceAmendmentDetailsDto;
import com.taxedge.dashboards.camanagers.gst.dto.SignatoryAmendmentDetailsDto;
import com.taxedge.gst.amendment.entity.AdditionalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.BankAccountAmendmentEntity;
import com.taxedge.gst.amendment.entity.ContactAmendmentEntity;
import com.taxedge.gst.amendment.entity.LegalNameAmendmentEntity;
import com.taxedge.gst.amendment.entity.PrincipalPlaceAmendmentEntity;
import com.taxedge.gst.amendment.entity.SignatoryAmendmentEntity;

@Mapper(componentModel = "spring")
public interface AmendmentDetailsMapper {

    @Mapping(target = "customerId", source = "custId")
    CustomerDetailsDto toCustomerDetailsDto(Customer customer);

    // Legal Name Amendment mappings
    LegalNameAmendmentDetailsDto toDto(LegalNameAmendmentEntity entity);
    List<LegalNameAmendmentDetailsDto> toDtoList(List<LegalNameAmendmentEntity> entities);

    // Additional Place Amendment mappings
    AdditionalPlaceAmendmentDetailsDto toAdditionalPlaceDto(AdditionalPlaceAmendmentEntity entity);
    List<AdditionalPlaceAmendmentDetailsDto> toAdditionalPlaceDtoList(List<AdditionalPlaceAmendmentEntity> entities);

    // Bank Account Amendment mappings
    BankAccountAmendmentDetailsDto toBankAccountDto(BankAccountAmendmentEntity entity);
    List<BankAccountAmendmentDetailsDto> toBankAccountDtoList(List<BankAccountAmendmentEntity> entities);

    // Contact Amendment mappings
    ContactAmendmentDetailsDto toContactDto(ContactAmendmentEntity entity);
    List<ContactAmendmentDetailsDto> toContactDtoList(List<ContactAmendmentEntity> entities);

    // Principal Place Amendment mappings
    PrincipalPlaceAmendmentDetailsDto toPrincipalPlaceDto(PrincipalPlaceAmendmentEntity entity);
    List<PrincipalPlaceAmendmentDetailsDto> toPrincipalPlaceDtoList(List<PrincipalPlaceAmendmentEntity> entities);

    // Signatory Amendment mappings
    SignatoryAmendmentDetailsDto toSignatoryDto(SignatoryAmendmentEntity entity);
    List<SignatoryAmendmentDetailsDto> toSignatoryDtoList(List<SignatoryAmendmentEntity> entities);
}
