package com.taxedge.myapplications.itr.reviseditr.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.myapplications.itr.reviseditr.dto.RevisedItrMyApplicationResponseDto;

@Mapper(componentModel = "spring")
public interface RevisedItrMyApplicationsMapper {

    @Mapping(target = "applicationType", constant = "REVISED_ITR")
    @Mapping(target = "assignedAgentId", source = "assignedAgent.id")
    @Mapping(target = "panCardUploaded", expression = "java(revisedItr.getDocument() != null && revisedItr.getDocument().getPanCard() != null && revisedItr.getDocument().getPanCard().length > 0)")
    @Mapping(target = "aadhaarCardUploaded", expression = "java(revisedItr.getDocument() != null && revisedItr.getDocument().getAadhaarCard() != null && revisedItr.getDocument().getAadhaarCard().length > 0)")
    @Mapping(target = "form16Uploaded", expression = "java(revisedItr.getDocument() != null && revisedItr.getDocument().getForm16Form16A() != null && revisedItr.getDocument().getForm16Form16A().length > 0)")
    @Mapping(target = "aisTisStatementUploaded", expression = "java(revisedItr.getDocument() != null && revisedItr.getDocument().getAisTisStatement() != null && revisedItr.getDocument().getAisTisStatement().length > 0)")
    @Mapping(target = "bankStatementsUploaded", expression = "java(revisedItr.getDocument() != null && revisedItr.getDocument().getBankStatements() != null && revisedItr.getDocument().getBankStatements().length > 0)")
    RevisedItrMyApplicationResponseDto toDto(RevisedItr revisedItr);
}
