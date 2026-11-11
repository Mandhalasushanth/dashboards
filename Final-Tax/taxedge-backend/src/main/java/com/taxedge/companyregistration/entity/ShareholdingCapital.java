package com.taxedge.companyregistration.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "shareholding_capital")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareholdingCapital {

	@Id
	@Column(name = "shareholding_capital_id", length = 35)
	private String shareholdingCapitalId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "company_registration_id", nullable = false)
	private CompanyDetails companyDetails;

	@Column(name = "authorised_capital", nullable = false, precision = 15, scale = 2)
	private BigDecimal authorisedCapital;

	@Column(name = "face_value_per_share", nullable = false, precision = 15, scale = 2)
	private BigDecimal faceValuePerShare;

	@Column(name = "authorised_shares", nullable = false)
	private Long authorisedShares;

	@Column(name = "subscribed_capital", nullable = false, precision = 15, scale = 2)
	private BigDecimal subscribedCapital;

	@Builder.Default
	@OneToMany(mappedBy = "shareholdingCapital", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ShareholdingPattern> shareholdingPattern = new ArrayList<>();
}