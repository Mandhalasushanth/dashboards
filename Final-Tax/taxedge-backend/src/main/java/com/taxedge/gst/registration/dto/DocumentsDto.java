package com.taxedge.gst.registration.dto;

import com.taxedge.gst.registration.enums.PrincipalPlaceAddressType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentsDto {

	private String documentId;

	private String gstId;

	private byte[] panCard;

	private byte[] aadhaarCard;

	private byte[] businessRegistrationProof;

	private PrincipalPlaceAddressType principalPlaceAddressType;

	private byte[] principalPlaceAddressProof;

	private byte[] bankPassbookOrCancelledCheque;

	private byte[] passportSizePhotograph;
}
