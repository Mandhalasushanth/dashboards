package com.taxedge.itr.reviseditr.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisedItrDetailsDto {

	@NotBlank(message = "Revised ITR ID is required")
	private String revisedItrId;

	@NotBlank(message = "Salary/Business income is required")
	private String salaryBusinessIncome;

	@NotBlank(message = "Other income is required")
	private String otherIncome;

	@NotBlank(message = "80C deduction is required")
	private String deduction80C;

	@NotBlank(message = "80D deduction is required")
	private String deduction80D;

	@NotBlank(message = "Home loan interest is required")
	private String homeLoanInterest;

	@NotBlank(message = "Taxable income is required")
	private String taxableIncome;

	@NotBlank(message = "Bank account for refund is required")
	private String bankAccountForRefund;

	@NotBlank(message = "IFSC code is required")
	private String ifscCode;
}
