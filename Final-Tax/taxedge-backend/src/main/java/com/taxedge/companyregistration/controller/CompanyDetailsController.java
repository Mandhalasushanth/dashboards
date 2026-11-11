package com.taxedge.companyregistration.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import com.taxedge.companyregistration.dto.DocumentsKycChecklistDto;
import com.taxedge.companyregistration.service.DocumentsKycChecklistService;

import com.taxedge.companyregistration.dto.CompanyDetailsDto;
import com.taxedge.companyregistration.dto.DocumentsKycChecklistDto;
import com.taxedge.companyregistration.dto.PromoterDirectorDetailsDto;
import com.taxedge.companyregistration.dto.RegisteredOfficeDetailsDto;
import com.taxedge.companyregistration.dto.ShareholdingCapitalDto;
import com.taxedge.companyregistration.service.CompanyDetailsService;
import com.taxedge.companyregistration.service.DocumentsKycChecklistService;
import com.taxedge.companyregistration.service.PromoterDirectorDetailsService;
import com.taxedge.companyregistration.service.RegisteredOfficeDetailsService;
import com.taxedge.companyregistration.service.ShareholdingCapitalService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CompanyDetailsController {

	private final CompanyDetailsService companyDetailsService;
	private final RegisteredOfficeDetailsService registeredOfficeDetailsService;
	private final PromoterDirectorDetailsService promoterDirectorDetailsService;
	private final DocumentsKycChecklistService documentsKycChecklistService;
	private final ShareholdingCapitalService capitalService;

	@PostMapping("/company-registration/register")
	public ResponseEntity<String> registerCompany(@Valid @RequestBody CompanyDetailsDto dto) {

		return ResponseEntity.ok(companyDetailsService.registerCompany(dto));
	}

	@GetMapping("/company-registration/{companyRegistrationId}")
	public ResponseEntity<CompanyDetailsDto> getCompanyDetails(@PathVariable String companyRegistrationId) {

		return ResponseEntity.ok(companyDetailsService.getCompanyDetails(companyRegistrationId));
	}

	@PutMapping("/company-registration/{companyRegistrationId}")
	public ResponseEntity<String> updateCompanyDetails(@PathVariable String companyRegistrationId,
			@Valid @RequestBody CompanyDetailsDto dto) {

		return ResponseEntity.ok(companyDetailsService.updateCompanyDetails(companyRegistrationId, dto));
	}

	@DeleteMapping("/company-registration/{companyRegistrationId}")
	public ResponseEntity<String> deleteCompanyDetails(@PathVariable String companyRegistrationId) {

		return ResponseEntity.ok(companyDetailsService.deleteCompanyDetails(companyRegistrationId));
	}

	@PostMapping("/registered-office-details/register")
	public ResponseEntity<String> registerRegisteredOfficeDetails(@Valid @RequestBody RegisteredOfficeDetailsDto dto) {

		return ResponseEntity.ok(registeredOfficeDetailsService.registerRegisteredOfficeDetails(dto));
	}

	@GetMapping("/registered-office-details/{registeredOfficeId}")
	public ResponseEntity<RegisteredOfficeDetailsDto> getRegisteredOfficeDetails(
			@PathVariable String registeredOfficeId) {

		return ResponseEntity.ok(registeredOfficeDetailsService.getRegisteredOfficeDetails(registeredOfficeId));
	}

	@PutMapping("/registered-office-details/{registeredOfficeId}")
	public ResponseEntity<String> updateRegisteredOfficeDetails(@PathVariable String registeredOfficeId,
			@Valid @RequestBody RegisteredOfficeDetailsDto dto) {

		return ResponseEntity.ok(registeredOfficeDetailsService.updateRegisteredOfficeDetails(registeredOfficeId, dto));
	}

	@DeleteMapping("/registered-office-details/{registeredOfficeId}")
	public ResponseEntity<String> deleteRegisteredOfficeDetails(@PathVariable String registeredOfficeId) {

		return ResponseEntity.ok(registeredOfficeDetailsService.deleteRegisteredOfficeDetails(registeredOfficeId));
	}

	@PostMapping("/promoter-director-details/register")
	public ResponseEntity<List<String>> registerPromoterDirectorDetails(
			@Valid @RequestBody List<@Valid PromoterDirectorDetailsDto> dtoList) {

		return ResponseEntity.ok(promoterDirectorDetailsService.registerPromoterDirectorDetails(dtoList));
	}

	@GetMapping("/company-registration/{companyRegistrationId}/promoters")
	public ResponseEntity<List<PromoterDirectorDetailsDto>> getAllPromoterDirectorDetails(
			@PathVariable String companyRegistrationId) {

		return ResponseEntity.ok(promoterDirectorDetailsService.getAllPromoterDirectorDetails(companyRegistrationId));
	}

	@PutMapping("/promoter-director-details/{promoterDirectorId}")
	public ResponseEntity<String> updatePromoterDirectorDetails(@PathVariable String promoterDirectorId,
			@Valid @RequestBody PromoterDirectorDetailsDto dto) {

		return ResponseEntity.ok(promoterDirectorDetailsService.updatePromoterDirectorDetails(promoterDirectorId, dto));
	}

	@DeleteMapping("/promoter-director-details/{promoterDirectorId}")
	public ResponseEntity<String> deletePromoterDirectorDetails(@PathVariable String promoterDirectorId) {

		return ResponseEntity.ok(promoterDirectorDetailsService.deletePromoterDirectorDetails(promoterDirectorId));
	}

	@PostMapping(value = "/documents-kyc-checklist/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> uploadDocuments(@RequestParam("companyRegistrationId") String companyRegistrationId,
			@RequestParam(value = "panCard", required = false) MultipartFile panCard,
			@RequestParam(value = "identityAddressProof", required = false) MultipartFile identityAddressProof,
			@RequestParam(value = "passportPhoto", required = false) MultipartFile passportPhoto,
			@RequestParam(value = "officeAddressProof", required = false) MultipartFile officeAddressProof,
			@RequestParam(value = "officeUtilityBill", required = false) MultipartFile officeUtilityBill,
			@RequestParam(value = "ownerNoc", required = false) MultipartFile ownerNoc,
			@RequestParam(value = "statutoryDocuments", required = false) MultipartFile statutoryDocuments,
			@RequestParam(value = "aoaEAoa", required = false) MultipartFile aoaEAoa) throws IOException {

		DocumentsKycChecklistDto dto = DocumentsKycChecklistDto.builder().panCard(panCard)
				.identityAddressProof(identityAddressProof).passportPhoto(passportPhoto)
				.officeAddressProof(officeAddressProof).officeUtilityBill(officeUtilityBill).ownerNoc(ownerNoc)
				.statutoryDocuments(statutoryDocuments).aoaEAoa(aoaEAoa).build();

		String result = documentsKycChecklistService.uploadDocuments(companyRegistrationId, dto);

		return ResponseEntity.status(HttpStatus.CREATED).body(result);
	}

	@GetMapping("/documents-kyc-checklist/{documentId}")
	public ResponseEntity<DocumentsKycChecklistDto> getDocuments(@PathVariable String documentId) {

		return ResponseEntity.ok(documentsKycChecklistService.getDocumentsById(documentId));
	}

	@PutMapping(value = "/documents-kyc-checklist/{documentId}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> updateDocuments(@PathVariable String documentId,
			@RequestParam(value = "panCard", required = false) MultipartFile panCard,
			@RequestParam(value = "identityAddressProof", required = false) MultipartFile identityAddressProof,
			@RequestParam(value = "passportPhoto", required = false) MultipartFile passportPhoto,
			@RequestParam(value = "officeAddressProof", required = false) MultipartFile officeAddressProof,
			@RequestParam(value = "officeUtilityBill", required = false) MultipartFile officeUtilityBill,
			@RequestParam(value = "ownerNoc", required = false) MultipartFile ownerNoc,
			@RequestParam(value = "statutoryDocuments", required = false) MultipartFile statutoryDocuments,
			@RequestParam(value = "aoaEAoa", required = false) MultipartFile aoaEAoa) throws java.io.IOException {

		DocumentsKycChecklistDto dto = DocumentsKycChecklistDto.builder().panCard(panCard)
				.identityAddressProof(identityAddressProof).passportPhoto(passportPhoto)
				.officeAddressProof(officeAddressProof).officeUtilityBill(officeUtilityBill).ownerNoc(ownerNoc)
				.statutoryDocuments(statutoryDocuments).aoaEAoa(aoaEAoa).build();

		String result = documentsKycChecklistService.updateDocumentsById(documentId, dto);

		return ResponseEntity.ok(result);
	}

	@DeleteMapping("/documents-kyc-checklist/{documentId}")
	public ResponseEntity<String> deleteDocuments(@PathVariable String documentId) {

		return ResponseEntity.ok(documentsKycChecklistService.deleteDocumentsById(documentId));
	}

	@PostMapping("/register")
	public ResponseEntity<String> registerShareholdingCapital(@Valid @RequestBody ShareholdingCapitalDto dto) {

		return ResponseEntity.status(HttpStatus.CREATED).body(capitalService.registerShareholdingCapital(dto));
	}

	@GetMapping("/shareholding-capital/{shareholdingCapitalId}")
	public ResponseEntity<ShareholdingCapitalDto> getShareholdingCapitalById(
			@PathVariable String shareholdingCapitalId) {

		return ResponseEntity.ok(capitalService.getShareholdingCapitalById(shareholdingCapitalId));
	}

	@PutMapping("/shareholding-capital/{shareholdingCapitalId}/update")
	public ResponseEntity<String> updateShareholdingCapital(@PathVariable String shareholdingCapitalId,
			@Valid @RequestBody ShareholdingCapitalDto dto) {

		return ResponseEntity.ok(capitalService.updateShareholdingCapital(shareholdingCapitalId, dto));
	}

	@DeleteMapping("/shareholding-capital/{shareholdingCapitalId}")
	public ResponseEntity<String> deleteShareholdingCapital(@PathVariable String shareholdingCapitalId) {

		return ResponseEntity.ok(capitalService.deleteShareholdingCapital(shareholdingCapitalId));
	}

}