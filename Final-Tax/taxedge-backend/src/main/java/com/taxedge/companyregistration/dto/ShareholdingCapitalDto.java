package com.taxedge.companyregistration.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareholdingCapitalDto {

	private String shareholdingCapitalId;

	@NotBlank(message = "Company registration ID is required")
	private String companyRegistrationId;

	@NotNull(message = "Authorised capital is required")
	@Positive(message = "Authorised capital must be greater than zero")
	private BigDecimal authorisedCapital;

	@NotNull(message = "Face value per share is required")
	@Positive(message = "Face value per share must be greater than zero")
	private BigDecimal faceValuePerShare;

	@NotNull(message = "Authorised shares are required")
	@Positive(message = "Authorised shares must be greater than zero")
	private Long authorisedShares;

	@NotNull(message = "Subscribed capital is required")
	@Positive(message = "Subscribed capital must be greater than zero")
	private BigDecimal subscribedCapital;

	@NotEmpty(message = "At least one shareholding pattern is required")
	@Valid
	private List<ShareholdingPatternDto> shareholdingPattern;
}