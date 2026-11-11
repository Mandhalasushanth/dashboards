package com.taxedge.companyregistration.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shareholding_pattern")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareholdingPattern {

	@Id
	@Column(name = "shareholding_pattern_id", length = 35)
	private String shareholdingPatternId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "shareholding_capital_id", nullable = false)
	private ShareholdingCapital shareholdingCapital;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "company_registration_id", nullable = false)
	private CompanyDetails companyDetails;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "promoter_director_id", nullable = false)
	private PromoterDirectorDetails promoterDirectorDetails;

	@Column(name = "allocated_shares", nullable = false)
	private Long allocatedShares;

	@Column(name = "amount", nullable = false, precision = 15, scale = 2)
	private BigDecimal amount;
}