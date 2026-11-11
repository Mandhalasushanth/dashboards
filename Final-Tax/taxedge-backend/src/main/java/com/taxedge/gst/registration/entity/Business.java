package com.taxedge.gst.registration.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.gst.registration.enums.AccountType;
import com.taxedge.gst.registration.enums.CompositionScheme;
import com.taxedge.gst.registration.enums.ConstitutionOfBusiness;
import com.taxedge.gst.registration.enums.NatureOfBusiness;
import com.taxedge.gst.registration.enums.PlaceOfBusiness;
import com.taxedge.gst.registration.enums.ReasonForRegistration;
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "business_details")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Business {

	@Id
	@Column(name = "gst_id", nullable = false, unique = true, length = 35)
	private String gstId;

	@ManyToOne
	@JoinColumn(name = "cust_id", nullable = false)
	private Customer customer;

	@Column(name = "legal_name", nullable = false, length = 100)
	private String legalName;

	@Column(name = "trade_name", nullable = false, length = 100)
	private String tradeName;

	@Enumerated(EnumType.STRING)
	@Column(name = "constitution_of_business", nullable = false)
	private ConstitutionOfBusiness constitutionOfBusiness;

	@Enumerated(EnumType.STRING)
	@Column(name = "nature_of_business", nullable = false)
	private NatureOfBusiness natureOfBusiness;

	@Column(name = "date_of_commencement", nullable = false)
	private LocalDate dateOfCommencement;

	@Column(name = "business_pan", length = 10)
	private String businessPan;

	@Enumerated(EnumType.STRING)
	@Column(name = "reason_for_registration", nullable = false)
	private ReasonForRegistration reasonForRegistration;

	@Enumerated(EnumType.STRING)
	@Column(name = "composition_scheme", nullable = false)
	private CompositionScheme compositionScheme;

	@Enumerated(EnumType.STRING)
	@Column(name = "place_of_business", nullable = false)
	private PlaceOfBusiness placeOfBusiness;

	@Column(name = "business_address", nullable = false, length = 255)
	private String businessAddress;

	@Column(name = "city", nullable = false, length = 50)
	private String city;

	@Column(name = "district", nullable = false, length = 50)
	private String district;

	@Column(name = "state", nullable = false, length = 50)
	private String state;

	@Column(name = "pin_code", nullable = false, length = 6)
	private String pinCode;

	@Column(name = "hsn_sac_code", nullable = false, length = 8)
	private String hsnSac;

	@Column(name = "account_holder_name", nullable = false, length = 100)
	private String accountHolderName;

	@Column(name = "bank_account_number", nullable = false, length = 18)
	private String bankAccountNumber;

	@Column(name = "ifsc_code", nullable = false, length = 11)
	private String ifscCode;

	@Column(name = "bank_name", nullable = false, length = 100)
	private String bankName;

	@Column(name = "branch_name", nullable = false, length = 100)
	private String branchName;

	@Enumerated(EnumType.STRING)
	@Column(name = "account_type", nullable = false)
	private AccountType accountType;

	@Column(name = "authorised_signatory", nullable = false, length = 10)
	private String authorisedSignatory;

	@Column(name = "signatory_name", nullable = false, length = 100)
	private String signatoryName;

	@Column(name = "signatory_pan", nullable = false, length = 10)
	private String signatoryPan;

	@Column(name = "signatory_dob", nullable = false)
	private LocalDate signatoryDob;

	@Column(name = "designation", nullable = false, length = 50)
	private String designation;

	@Column(name = "signatory_mobile", nullable = false, length = 10)
	private String signatoryMobile;

	@Column(name = "signatory_email", nullable = false, length = 150)
	private String signatoryEmail;

	@OneToOne(mappedBy = "business", cascade = CascadeType.ALL, orphanRemoval = true)
	private Documents documents;

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
