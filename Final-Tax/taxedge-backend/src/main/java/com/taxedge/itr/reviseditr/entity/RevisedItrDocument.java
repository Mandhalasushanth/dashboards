package com.taxedge.itr.reviseditr.entity;

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
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "revised_itr_document")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisedItrDocument {

	@Id
	@Column(name = "document_id", nullable = false, unique = true)
	private String documentId;

	@OneToOne
	@JoinColumn(name = "revised_itr_id", nullable = false)
	private RevisedItr revisedItr;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "pan_card", columnDefinition = "bytea")
	private byte[] panCard;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "aadhaar_card", columnDefinition = "bytea")
	private byte[] aadhaarCard;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "form_16_form_16a", columnDefinition = "bytea")
	private byte[] form16Form16A;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "ais_tis_statement", columnDefinition = "bytea")
	private byte[] aisTisStatement;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "bank_statements", columnDefinition = "bytea")
	private byte[] bankStatements;

	@Basic(fetch = FetchType.LAZY)
	@Column(name = "investment_proofs", columnDefinition = "bytea")
	private byte[] investmentProofs;
}
