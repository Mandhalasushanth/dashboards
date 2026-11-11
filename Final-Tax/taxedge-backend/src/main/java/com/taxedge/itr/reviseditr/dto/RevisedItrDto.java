package com.taxedge.itr.reviseditr.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisedItrDto {

	@NotBlank(message = "Customer ID is required")
	private String customerId;

	@NotBlank(message = "ITR acknowledgement number is required")
	private String itrAcknowledgementNumber;

	@NotBlank(message = "Assessment year is required")
	private String assessmentYear;
}
