package com.taxedge.gst.registration.entity;

import com.taxedge.gst.registration.enums.PrincipalPlaceAddressType;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "gst_reg_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Documents {

	@Id
	@Column(name = "document_id", nullable = false, unique = true, length = 35)
	private String documentId;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "gst_id", nullable = false, unique = true)
	private Business business;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "pan_card", columnDefinition = "bytea")
	private byte[] panCard;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "aadhaar_card", columnDefinition = "bytea")
	private byte[] aadhaarCard;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "business_registration_proof", columnDefinition = "bytea")
	private byte[] businessRegistrationProof;

	@Enumerated(EnumType.STRING)
	@Column(name = "principal_place_address_type", length = 50)
	private PrincipalPlaceAddressType principalPlaceAddressType;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "principal_place_address_proof", columnDefinition = "bytea")
	private byte[] principalPlaceAddressProof;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "bank_passbook_or_cancelled_cheque", columnDefinition = "bytea")
	private byte[] bankPassbookOrCancelledCheque;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "passport_size_photograph", columnDefinition = "bytea")
	private byte[] passportSizePhotograph;
}
