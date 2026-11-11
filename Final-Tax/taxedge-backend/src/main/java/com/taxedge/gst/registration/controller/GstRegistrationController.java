package com.taxedge.gst.registration.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.registration.dto.BusinessRequest;
import com.taxedge.gst.registration.dto.BusinessResponse;
import com.taxedge.gst.registration.dto.BusinessUpdateRequest;
import com.taxedge.gst.registration.dto.DocumentsDto;
import com.taxedge.gst.registration.enums.PrincipalPlaceAddressType;
import com.taxedge.gst.registration.service.BusinessService;
import com.taxedge.gst.registration.service.DocumentsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/gst")
public class GstRegistrationController {

	@Autowired
	private BusinessService businessService;

	@Autowired
	private DocumentsService documentsService;

	@GetMapping("/business/{gstId}")
	public ResponseEntity<BusinessResponse> getBusiness(@PathVariable String gstId) {

		BusinessResponse business = businessService.getBusiness(gstId);

		return ResponseEntity.ok(business);
	}

	@PostMapping("/business/register")
	public ResponseEntity<String> registerBusiness(@Valid @RequestBody BusinessRequest businessRequest) {

		String result = businessService.registerBusiness(businessRequest);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@PutMapping("/business/update/{gstId}")
	public ResponseEntity<String> updateBusiness(@PathVariable String gstId,
			@Valid @RequestBody BusinessUpdateRequest businessUpdateRequest) {

		String result = businessService.updateBusiness(gstId, businessUpdateRequest);

		return ResponseEntity.ok(result);
	}

	

	@PostMapping(value = "/documents/{gstId}/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> uploadFile(@PathVariable String gstId,

			@RequestParam(value = "panCard", required = false) MultipartFile panCard,

			@RequestParam(value = "aadhaarCard", required = false) MultipartFile aadhaarCard,

			@RequestParam(value = "businessRegistrationProof", required = false) MultipartFile businessRegistrationProof,

			@RequestParam(value = "principalPlaceAddressType", required = false) String principalPlaceAddressType,

			@RequestParam(value = "principalPlaceAddressProof", required = false) MultipartFile principalPlaceAddressProof,

			@RequestParam(value = "bankPassbookOrCancelledCheque", required = false) MultipartFile bankPassbookOrCancelledCheque,

			@RequestParam(value = "passportSizePhotograph", required = false) MultipartFile passportSizePhotograph)
			throws IOException {

		PrincipalPlaceAddressType addressType = null;

		if (principalPlaceAddressType != null && !principalPlaceAddressType.isEmpty()) {

			addressType = PrincipalPlaceAddressType.valueOf(principalPlaceAddressType);
		}

		String result = documentsService.uploadFile(gstId, panCard, aadhaarCard, businessRegistrationProof, addressType,
				principalPlaceAddressProof, bankPassbookOrCancelledCheque, passportSizePhotograph);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@GetMapping("/documents/{documentId}")
	public ResponseEntity<DocumentsDto> getDocuments(@PathVariable String documentId) {

		DocumentsDto documents = documentsService.getDocuments(documentId);

		return ResponseEntity.ok(documents);
	}

	@PutMapping(value = "/documents/{documentId}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> updateFile(@PathVariable String documentId,

			@RequestParam(value = "panCard", required = false) MultipartFile panCard,

			@RequestParam(value = "aadhaarCard", required = false) MultipartFile aadhaarCard,

			@RequestParam(value = "businessRegistrationProof", required = false) MultipartFile businessRegistrationProof,

			@RequestParam(value = "principalPlaceAddressType", required = false) String principalPlaceAddressType,

			@RequestParam(value = "principalPlaceAddressProof", required = false) MultipartFile principalPlaceAddressProof,

			@RequestParam(value = "bankPassbookOrCancelledCheque", required = false) MultipartFile bankPassbookOrCancelledCheque,

			@RequestParam(value = "passportSizePhotograph", required = false) MultipartFile passportSizePhotograph)
			throws IOException {

		PrincipalPlaceAddressType addressType = null;

		if (principalPlaceAddressType != null && !principalPlaceAddressType.isEmpty()) {

			addressType = PrincipalPlaceAddressType.valueOf(principalPlaceAddressType);
		}

		String result = documentsService.updateFile(documentId, panCard, aadhaarCard, businessRegistrationProof,
				addressType, principalPlaceAddressProof, bankPassbookOrCancelledCheque, passportSizePhotograph);

		return ResponseEntity.ok(result);
	}

	@DeleteMapping("/documents/{documentId}")
	public ResponseEntity<String> deleteFile(@PathVariable String documentId) {

		String result = documentsService.deleteFile(documentId);

		return ResponseEntity.ok(result);
	}
	
	
	
	
	@PostMapping("/submit")
	public ResponseEntity<String> submitGstRegistration(
	        @RequestParam String gstId,
	        @RequestParam(required = false) String pushToken) {
	    return ResponseEntity.ok(businessService.submitRegistration(gstId, pushToken));
	}
	
	
}
