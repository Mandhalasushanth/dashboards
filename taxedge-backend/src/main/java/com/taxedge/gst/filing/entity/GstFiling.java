package com.taxedge.gst.filing.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.gst.filing.enums.FilingFrequency;
import com.taxedge.gst.filing.enums.FilingType;
import com.taxedge.gst.filing.enums.ReturnType;
import com.taxedge.gst.filing.enums.TaxCalculationMethod;
import com.taxedge.gst.registration.enums.RegisterationStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "gst_filing", uniqueConstraints = {
		@UniqueConstraint(name = "uk_gst_filing_gstin_fy_period_return", columnNames = { "gstin", "financial_year",
				"filing_period", "return_type" }) })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GstFiling {

	@Id
	@Column(name = "gstfiling_id", nullable = false, unique = true)
	private String gstfilingId;

	@Column(name = "gstin", nullable = false, length = 15)
	private String gstin;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "cust_id", nullable = false)
	private Customer customer;

	@Column(name = "financial_year", nullable = false, length = 7)
	private String financialYear;

	@Column(name = "filing_period", nullable = false, length = 30)
	private String filingPeriod;

	@Enumerated(EnumType.STRING)
	@Column(name = "filing_frequency", nullable = false, length = 30)
	private FilingFrequency filingFrequency;

	@Enumerated(EnumType.STRING)
	@Column(name = "return_type", nullable = false, length = 20)
	private ReturnType returnType;

	@Enumerated(EnumType.STRING)
	@Column(name = "filing_type", nullable = false, length = 20)
	private FilingType filingType;

	@Enumerated(EnumType.STRING)
	@Column(name = "tax_calculation_method", length = 40)
	private TaxCalculationMethod taxCalculationMethod;

	@Column(name = "estimated_taxable_sales")
	private Long estimatedTaxableSales;

	@Column(name = "estimated_taxable_purchases")
	private Long estimatedTaxablePurchases;

	@Column(name = "estimated_eligible_itc")
	private Long estimatedEligibleItc;
	
	@OneToOne(mappedBy = "gstFiling", cascade = CascadeType.ALL, orphanRemoval = true)
	private GstFilingDocuments documents;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_agent_id")
	private AgentLogin assignedAgent;

	@Builder.Default
	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 20)
	private RegisterationStatus status = RegisterationStatus.DRAFT;
	
	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@Column(name = "submitted_at")
	private LocalDateTime submittedAt;
}
