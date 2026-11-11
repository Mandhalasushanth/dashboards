package com.taxedge.itr.filing.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.auth.entity.AgentLogin;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "itr_filing")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItrFiling {

	@Id
	@Column(name = "itr_id", nullable = false, unique = true)
	private String itrId;

	@Column(name = "assessment_year", nullable = false)
	private String assessmentYear;

	@Column(name = "residential_status", nullable = false)
	private String residentialStatus;

	@Column(name = "filing_type", nullable = false)
	private String filingType;

	@Column(name = "bank_name", nullable = false)
	private String bankName;

	@Column(name = "account_number", nullable = false)
	private String accountNumber;

	@Column(name = "ifsc_code", nullable = false)
	private String ifscCode;

	@ManyToOne
	@JoinColumn(name = "cust_id", nullable = false)
	private Customer customer;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_agent_id")
	private AgentLogin assignedAgent;

	@OneToMany(mappedBy = "itrFiling", cascade = CascadeType.ALL)
	private List<ItrDocument> documents;

	@OneToOne(mappedBy = "itrFiling", cascade = CascadeType.ALL)
	private SalaryIncome salaryIncome;

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
