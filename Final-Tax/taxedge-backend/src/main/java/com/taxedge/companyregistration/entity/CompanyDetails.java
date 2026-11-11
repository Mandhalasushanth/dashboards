package com.taxedge.companyregistration.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.auth.entity.AgentLogin;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "company_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDetails {

	@Id
	@Column(name = "company_registration_id", nullable = false, unique = true, length = 50)
	private String companyRegistrationId;

	@Column(name = "category_of_company", nullable = false, length = 100)
	private String categoryOfCompany;

	@Column(name = "sub_category_of_company", length = 150)
	private String subCategoryOfCompany;

	@Column(name = "proposed_company_name", nullable = false, length = 255)
	private String proposedCompanyName;

	@Column(name = "alternative_proposed_name", length = 255)
	private String alternativeProposedName;

	@Column(name = "primary_business_activity", nullable = false, length = 500)
	private String primaryBusinessActivity;

	@Column(name = "nic_5_digit_code", length = 5)
	private String nic5DigitCode;

	@Column(name = "secondary_activity", columnDefinition = "TEXT")
	private String secondaryActivity;

	@Column(name = "company_structure", length = 150)
	private String companyStructure;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cust_id", nullable = false)
	private Customer customer;

	// The agent the CA manager assigned this registration to; null until assigned (same as GST and ITR).
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_agent_id")
	private AgentLogin assignedAgent;

	// Nullable so rows saved before these columns existed still load.
	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
}
