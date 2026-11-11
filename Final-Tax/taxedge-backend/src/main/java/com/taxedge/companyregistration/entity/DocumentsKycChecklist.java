package com.taxedge.companyregistration.entity;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "documents_kyc_checklist")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentsKycChecklist {

	@Id
	@Column(name = "document_id", nullable = false, unique = true, length = 50)
	private String documentId;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "company_registration_id", nullable = false, unique = true)
	private CompanyDetails companyDetails;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "pan_card", columnDefinition = "bytea")
	private byte[] panCard;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "identity_address_proof", columnDefinition = "bytea")
	private byte[] identityAddressProof;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "passport_photo", columnDefinition = "bytea")
	private byte[] passportPhoto;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "office_address_proof", columnDefinition = "bytea")
	private byte[] officeAddressProof;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "office_utility_bill", columnDefinition = "bytea")
	private byte[] officeUtilityBill;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "owner_noc", columnDefinition = "bytea")
	private byte[] ownerNoc;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "statutory_documents", columnDefinition = "bytea")
	private byte[] statutoryDocuments;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "aoa_e_aoa", columnDefinition = "bytea")
	private byte[] aoaEAoa;
}