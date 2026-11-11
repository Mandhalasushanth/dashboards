package com.taxedge.itr.filing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {

	private byte[] form16PartAPartB;

	private byte[] form26as;

	private byte[] aisTis;

	private byte[] bankAccountStatement;

	private byte[] salaryPayslips;
	private byte[] capitalGainsStatement;
	private byte[] businessTurnover;
}
