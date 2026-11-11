package com.taxedge.itr.reviseditr.dto;

import com.taxedge.itr.reviseditr.enums.RevisionReason;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisionReasonDto {

	@NotBlank(message = "Revised ITR ID is required")
	private String revisedItrId;

	@NotNull(message = "Revision reason is required")
	private RevisionReason reason;

	private String otherReason;
}
