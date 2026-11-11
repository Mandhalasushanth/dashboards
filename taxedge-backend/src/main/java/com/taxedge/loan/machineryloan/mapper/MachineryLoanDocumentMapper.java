package com.taxedge.loan.machineryloan.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.taxedge.loan.machineryloan.dto.MachineryLoanDocumentDto;
import com.taxedge.loan.machineryloan.entity.MachineryLoanDocument;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.WARN)
public interface MachineryLoanDocumentMapper {

    @Mapping(target = "documentId", ignore = true)
    @Mapping(target = "machineryLoanApplication", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    MachineryLoanDocument toEntity(MachineryLoanDocumentDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "documentId", ignore = true)
    @Mapping(target = "machineryLoanApplication", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateFromDto(MachineryLoanDocumentDto dto,
                       @MappingTarget MachineryLoanDocument entity);

    MachineryLoanDocumentDto toDto(MachineryLoanDocument entity);
}
