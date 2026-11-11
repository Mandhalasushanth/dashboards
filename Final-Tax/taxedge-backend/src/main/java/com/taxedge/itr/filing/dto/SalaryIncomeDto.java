package com.taxedge.itr.filing.dto;

import com.taxedge.itr.filing.enums.AssetType;
import com.taxedge.itr.filing.enums.PropertyClassification;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryIncomeDto {

	@NotBlank(message = "Income source is required")
	private String incomeSource;

	private String employerLegalName;

	private String grossSalary;

	private String exemptAllowances;

	private String tdsDeductedByEmployer;

	private PropertyClassification propertyClassification;

	private String homeLoanInterestPaid;

	private String annualRentReceived;

	private String municipalTaxesPaid;

	private String howDoYouReportThisBusiness;

	private String grossTurnover;

	private String declaredNetProfit;

	private AssetType assetType;

	private String shortTermGains;

	private String longTermGains;

	private String savingsInterest;

	private String fdTermInterest;

	private String dividendIncome;

	private String otherMiscellaneous;
}
