package com.taxedge.companyregistration.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDetailsDto {

	private String companyRegistrationId;

	@NotBlank(message = "Category of Company is required")
	@Size(max = 100, message = "Category of Company cannot exceed 100 characters")
	private String categoryOfCompany;

	@Size(max = 150, message = "Sub-Category of Company cannot exceed 150 characters")
	private String subCategoryOfCompany;

	@NotBlank(message = "Proposed Company Name is required")
	@Size(max = 255, message = "Proposed Company Name cannot exceed 255 characters")
	private String proposedCompanyName;

	@Size(max = 255, message = "Alternative Proposed Name cannot exceed 255 characters")
	private String alternativeProposedName;

	@NotBlank(message = "Primary Business Activity is required")
	@Size(max = 500, message = "Primary Business Activity cannot exceed 500 characters")
	private String primaryBusinessActivity;

	@Pattern(regexp = "^[0-9]{5}$", message = "NIC Code must contain exactly 5 digits")
	private String nic5DigitCode;

	private String secondaryActivity;

	@Size(max = 150, message = "Company Structure cannot exceed 150 characters")
	private String companyStructure;

	@NotBlank(message = "Customer ID is required")
	private String customerId;
}