package com.taxedge.itr.filing.dto;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItrFilingPostDto {

	@NotBlank(message = "Customer ID is required")
	private String customerId;

	@NotBlank(message = "Assessment year is required")
	private String assessmentYear;

	@NotBlank(message = "Residential status is required")
	private String residentialStatus;

	@NotBlank(message = "Filing type is required")
	private String filingType;

	@NotBlank(message = "Bank name is required")
	private String bankName;

	@NotBlank(message = "Account number is required")
	private String accountNumber;

	@NotBlank(message = "IFSC code is required")
	private String ifscCode;
}
