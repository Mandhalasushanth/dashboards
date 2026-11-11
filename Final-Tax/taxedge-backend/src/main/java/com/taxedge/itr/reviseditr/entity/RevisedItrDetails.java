package com.taxedge.itr.reviseditr.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "revised_itr_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisedItrDetails {

	@Id
	@Column(name = "details_id", nullable = false, unique = true)
	private String detailsId;

	@OneToOne
	@JoinColumn(name = "revised_itr_id", nullable = false)
	private RevisedItr revisedItr;

	@Column(name = "salary_business_income")
	private String salaryBusinessIncome;

	@Column(name = "other_income")
	private String otherIncome;

	@Column(name = "80c_deduction")
	private String deduction80C;

	@Column(name = "80d_deduction")
	private String deduction80D;

	@Column(name = "home_loan_interest")
	private String homeLoanInterest;

	@Column(name = "taxable_income")
	private String taxableIncome;

	@Column(name = "bank_account_for_refund")
	private String bankAccountForRefund;

	@Column(name = "ifsc_code")
	private String ifscCode;
}
