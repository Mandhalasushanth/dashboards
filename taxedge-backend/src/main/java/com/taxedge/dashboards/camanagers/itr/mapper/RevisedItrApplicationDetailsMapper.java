package com.taxedge.dashboards.camanagers.itr.mapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.RevisedItrApplicationDetailsDto;
import com.taxedge.itr.reviseditr.entity.RevisedItr;
import com.taxedge.itr.reviseditr.entity.RevisedItrDetails;
import com.taxedge.itr.reviseditr.entity.RevisedItrDocument;
import com.taxedge.itr.reviseditr.entity.RevisionReasonEntity;

@Mapper(componentModel = "spring")
public interface RevisedItrApplicationDetailsMapper {

    @Mapping(target = "customerId", source = "custId")
    CustomerDetailsDto toCustomerDetailsDto(Customer customer);

    // Multi-source mapping for RevisedItr + RevisedItrDetails + RevisedItrDocument + RevisionReasonEntity
    @Mapping(target = "customer", source = "revisedItr.customer")
    @Mapping(target = "revisedItrId", source = "revisedItr.revisedItrId")
    @Mapping(target = "itrAcknowledgementNumber", source = "revisedItr.itrAcknowledgementNumber")
    @Mapping(target = "assessmentYear", source = "revisedItr.assessmentYear")
    @Mapping(target = "status", source = "revisedItr.status")
    @Mapping(target = "createdAt", source = "revisedItr.createdAt")
    @Mapping(target = "updatedAt", source = "revisedItr.updatedAt")
    @Mapping(target = "submittedAt", source = "revisedItr.submittedAt")

    // RevisedItrDetails mappings
    @Mapping(target = "detailsId", source = "details.detailsId")
    @Mapping(target = "salaryBusinessIncome", source = "details.salaryBusinessIncome")
    @Mapping(target = "otherIncome", source = "details.otherIncome")
    @Mapping(target = "deduction80C", source = "details.deduction80C")
    @Mapping(target = "deduction80D", source = "details.deduction80D")
    @Mapping(target = "homeLoanInterest", source = "details.homeLoanInterest")
    @Mapping(target = "taxableIncome", source = "details.taxableIncome")
    @Mapping(target = "bankAccountForRefund", source = "details.bankAccountForRefund")
    @Mapping(target = "ifscCode", source = "details.ifscCode")

    // RevisionReasonEntity mappings
    @Mapping(target = "revisionReasonId", source = "revisionReason.revisionReasonId")
    @Mapping(target = "reason", source = "revisionReason.reason")
    @Mapping(target = "otherReason", source = "revisionReason.otherReason")

    // RevisedItrDocument mappings
    @Mapping(target = "documentId", source = "document.documentId")
    @Mapping(target = "panCard", source = "document.panCard")
    @Mapping(target = "aadhaarCard", source = "document.aadhaarCard")
    @Mapping(target = "form16Form16A", source = "document.form16Form16A")
    @Mapping(target = "aisTisStatement", source = "document.aisTisStatement")
    @Mapping(target = "bankStatements", source = "document.bankStatements")
    @Mapping(target = "investmentProofs", source = "document.investmentProofs")
    RevisedItrApplicationDetailsDto toDto(RevisedItr revisedItr, RevisedItrDetails details, RevisedItrDocument document, RevisionReasonEntity revisionReason);

    default RevisedItrApplicationDetailsDto toDto(RevisedItr revisedItr) {
        if (revisedItr == null) {
            return null;
        }
        return toDto(revisedItr, revisedItr.getDetails(), revisedItr.getDocument(), revisedItr.getRevisionReason());
    }

    default List<RevisedItrApplicationDetailsDto> toDtoList(List<RevisedItr> list) {
        if (list == null || list.isEmpty()) {
            return Collections.emptyList();
        }
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }
}

