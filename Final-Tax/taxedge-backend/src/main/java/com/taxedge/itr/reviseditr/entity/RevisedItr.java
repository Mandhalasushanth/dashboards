package com.taxedge.itr.reviseditr.entity;

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
@Table(name = "revised_itr")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisedItr {

	@Id
	@Column(name = "revised_itr_id", nullable = false, unique = true)
	private String revisedItrId;

	@Column(name = "itr_acknowledgement_number", nullable = false)
	private String itrAcknowledgementNumber;

	@Column(name = "assessment_year", nullable = false)
	private String assessmentYear;

	@ManyToOne
	@JoinColumn(name = "cust_id", nullable = false)
	private Customer customer;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_agent_id")
	private AgentLogin assignedAgent;

	@OneToOne(mappedBy = "revisedItr", cascade = CascadeType.ALL)
	private RevisedItrDetails details;

	@OneToOne(mappedBy = "revisedItr", cascade = CascadeType.ALL)
	private RevisedItrDocument document;

	@OneToOne(mappedBy = "revisedItr", cascade = CascadeType.ALL)
	private RevisionReasonEntity revisionReason;

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
