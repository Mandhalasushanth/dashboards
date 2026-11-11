package com.taxedge.dashboards.camanagers.itr.mapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.ItrFilingDetailsDto;
import com.taxedge.itr.filing.entity.ItrDocument;
import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.itr.filing.entity.SalaryIncome;

@Mapper(componentModel = "spring")
public interface ItrFilingDetailsMapper {

    @Mapping(target = "customerId", source = "custId")
    CustomerDetailsDto toCustomerDetailsDto(Customer customer);

    @Mapping(target = "customer", source = "itrFiling.customer")
    @Mapping(target = "itrId", source = "itrFiling.itrId")
    @Mapping(target = "assessmentYear", source = "itrFiling.assessmentYear")
    @Mapping(target = "residentialStatus", source = "itrFiling.residentialStatus")
    @Mapping(target = "filingType", source = "itrFiling.filingType")
    @Mapping(target = "bankName", source = "itrFiling.bankName")
    @Mapping(target = "accountNumber", source = "itrFiling.accountNumber")
    @Mapping(target = "ifscCode", source = "itrFiling.ifscCode")
    @Mapping(target = "status", source = "itrFiling.status")
    @Mapping(target = "createdAt", source = "itrFiling.createdAt")
    @Mapping(target = "updatedAt", source = "itrFiling.updatedAt")
    @Mapping(target = "submittedAt", source = "itrFiling.submittedAt")
    // SalaryIncome mappings
    @Mapping(target = "incomeId", source = "salaryIncome.incomeId")
    @Mapping(target = "incomeSource", source = "salaryIncome.incomeSource")
    @Mapping(target = "employerLegalName", source = "salaryIncome.employerLegalName")
    @Mapping(target = "grossSalary", source = "salaryIncome.grossSalary")
    @Mapping(target = "exemptAllowances", source = "salaryIncome.exemptAllowances")
    @Mapping(target = "tdsDeductedByEmployer", source = "salaryIncome.tdsDeductedByEmployer")
    @Mapping(target = "propertyClassification", source = "salaryIncome.propertyClassification")
    @Mapping(target = "homeLoanInterestPaid", source = "salaryIncome.homeLoanInterestPaid")
    @Mapping(target = "annualRentReceived", source = "salaryIncome.annualRentReceived")
    @Mapping(target = "municipalTaxesPaid", source = "salaryIncome.municipalTaxesPaid")
    @Mapping(target = "howDoYouReportThisBusiness", source = "salaryIncome.howDoYouReportThisBusiness")
    @Mapping(target = "grossTurnover", source = "salaryIncome.grossTurnover")
    @Mapping(target = "declaredNetProfit", source = "salaryIncome.declaredNetProfit")
    @Mapping(target = "assetType", source = "salaryIncome.assetType")
    @Mapping(target = "shortTermGains", source = "salaryIncome.shortTermGains")
    @Mapping(target = "longTermGains", source = "salaryIncome.longTermGains")
    @Mapping(target = "savingsInterest", source = "salaryIncome.savingsInterest")
    @Mapping(target = "fdTermInterest", source = "salaryIncome.fdTermInterest")
    @Mapping(target = "dividendIncome", source = "salaryIncome.dividendIncome")
    @Mapping(target = "otherMiscellaneous", source = "salaryIncome.otherMiscellaneous")
    // ItrDocument mappings
    @Mapping(target = "documentId", source = "document.documentId")
    @Mapping(target = "form16PartAPartB", source = "document.form16PartAPartB")
    @Mapping(target = "form26as", source = "document.form26as")
    @Mapping(target = "aisTis", source = "document.aisTis")
    @Mapping(target = "bankAccountStatement", source = "document.bankAccountStatement")
    @Mapping(target = "salaryPayslips", source = "document.salaryPayslips")
    @Mapping(target = "capitalGainsStatement", source = "document.capitalGainsStatement")
    @Mapping(target = "businessTurnover", source = "document.businessTurnover")
    ItrFilingDetailsDto toDto(ItrFiling itrFiling, SalaryIncome salaryIncome, ItrDocument document);

    default ItrFilingDetailsDto toDto(ItrFiling itrFiling) {
        if (itrFiling == null) {
            return null;
        }
        ItrDocument doc = (itrFiling.getDocuments() != null && !itrFiling.getDocuments().isEmpty())
                ? itrFiling.getDocuments().get(0)
                : null;
        return toDto(itrFiling, itrFiling.getSalaryIncome(), doc);
    }

    default List<ItrFilingDetailsDto> toDtoList(List<ItrFiling> filings) {
        if (filings == null || filings.isEmpty()) {
            return Collections.emptyList();
        }
        return filings.stream().map(this::toDto).collect(Collectors.toList());
    }
}

