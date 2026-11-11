package com.taxedge.gst.registration.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.registration.dto.DocumentsDto;
import com.taxedge.gst.registration.enums.PrincipalPlaceAddressType;

public interface DocumentsService {

	String uploadFile(String gstId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile businessRegistrationProof, PrincipalPlaceAddressType principalPlaceAddressType,
			MultipartFile principalPlaceAddressProof, MultipartFile bankPassbookOrCancelledCheque,
			MultipartFile passportSizePhotograph) throws IOException;

	DocumentsDto getDocuments(String documentId);

	String updateFile(String documentId, MultipartFile panCard, MultipartFile aadhaarCard,
			MultipartFile businessRegistrationProof, PrincipalPlaceAddressType principalPlaceAddressType,
			MultipartFile principalPlaceAddressProof, MultipartFile bankPassbookOrCancelledCheque,
			MultipartFile passportSizePhotograph) throws IOException;

	String deleteFile(String documentId);
}
