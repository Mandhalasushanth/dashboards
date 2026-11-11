package com.taxedge.companyregistration.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.companyregistration.dto.DocumentsKycChecklistDto;
import com.taxedge.companyregistration.entity.DocumentsKycChecklist;

@Mapper(componentModel = "spring")
public interface DocumentsKycChecklistMapper {

	@Mapping(target = "documentId", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	@Mapping(target = "panCard", ignore = true)
	@Mapping(target = "identityAddressProof", ignore = true)
	@Mapping(target = "passportPhoto", ignore = true)
	@Mapping(target = "officeAddressProof", ignore = true)
	@Mapping(target = "officeUtilityBill", ignore = true)
	@Mapping(target = "ownerNoc", ignore = true)
	@Mapping(target = "statutoryDocuments", ignore = true)
	@Mapping(target = "aoaEAoa", ignore = true)
	DocumentsKycChecklist toEntity(DocumentsKycChecklistDto dto);

	@Mapping(target = "documentId", ignore = true)
	@Mapping(target = "companyDetails", ignore = true)
	@Mapping(target = "panCard", ignore = true)
	@Mapping(target = "identityAddressProof", ignore = true)
	@Mapping(target = "passportPhoto", ignore = true)
	@Mapping(target = "officeAddressProof", ignore = true)
	@Mapping(target = "officeUtilityBill", ignore = true)
	@Mapping(target = "ownerNoc", ignore = true)
	@Mapping(target = "statutoryDocuments", ignore = true)
	@Mapping(target = "aoaEAoa", ignore = true)
	void updateEntity(DocumentsKycChecklistDto dto, @MappingTarget DocumentsKycChecklist entity);
}