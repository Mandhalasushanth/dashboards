package com.taxedge.myapplications.itr.itrfiling.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.myapplications.itr.itrfiling.dto.ItrFilingMyApplicationResponseDto;

@Mapper(componentModel = "spring")
public interface ItrFilingMyApplicationsMapper {

    @Mapping(target = "applicationType", constant = "ITR_FILING")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "form16Uploaded", expression = "java(filing.getDocuments() != null && !filing.getDocuments().isEmpty() && filing.getDocuments().get(0).getForm16PartAPartB() != null && filing.getDocuments().get(0).getForm16PartAPartB().length > 0)")
    @Mapping(target = "form26asUploaded", expression = "java(filing.getDocuments() != null && !filing.getDocuments().isEmpty() && filing.getDocuments().get(0).getForm26as() != null && filing.getDocuments().get(0).getForm26as().length > 0)")
    @Mapping(target = "aisTisUploaded", expression = "java(filing.getDocuments() != null && !filing.getDocuments().isEmpty() && filing.getDocuments().get(0).getAisTis() != null && filing.getDocuments().get(0).getAisTis().length > 0)")
    @Mapping(target = "bankAccountStatementUploaded", expression = "java(filing.getDocuments() != null && !filing.getDocuments().isEmpty() && filing.getDocuments().get(0).getBankAccountStatement() != null && filing.getDocuments().get(0).getBankAccountStatement().length > 0)")
    @Mapping(target = "salaryPayslipsUploaded", expression = "java(filing.getDocuments() != null && !filing.getDocuments().isEmpty() && filing.getDocuments().get(0).getSalaryPayslips() != null && filing.getDocuments().get(0).getSalaryPayslips().length > 0)")
    ItrFilingMyApplicationResponseDto toDto(ItrFiling filing);
}
