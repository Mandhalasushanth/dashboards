package com.taxedge.gst.compliance.controller;

import java.io.IOException;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taxedge.gst.compliance.dto.GstComplianceDto;
import com.taxedge.gst.compliance.dto.GstComplianceResponseDto;
import com.taxedge.gst.compliance.service.GstComplianceService;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/gst/compliance")
@RequiredArgsConstructor
public class GstComplianceController {

	private final ObjectMapper objectMapper;
	private final Validator validator;
	private final GstComplianceService complianceService;

	@PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<GstComplianceResponseDto> createCompliance(

			@RequestPart("data") String data,

			@RequestPart(value = "reconciliationFile1", required = false) MultipartFile reconciliationFile1,

			@RequestPart(value = "reconciliationFile2", required = false) MultipartFile reconciliationFile2,

			@RequestPart(value = "noticeFile", required = false) MultipartFile noticeFile) throws IOException {

		GstComplianceDto dto = objectMapper.readValue(data, GstComplianceDto.class);

		validateDto(dto);

		GstComplianceResponseDto response = complianceService.createCompliance(dto, reconciliationFile1,
				reconciliationFile2, noticeFile);

		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}

	@GetMapping("/{gstin}/{id}")
	public ResponseEntity<GstComplianceDto> getCompliance(

			@PathVariable String gstin,

			@PathVariable String id) {

		GstComplianceDto response = complianceService.getCompliance(gstin, id);

		return ResponseEntity.ok(response);
	}

	@PutMapping(value = "/{gstin}/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<GstComplianceResponseDto> updateCompliance(

			@PathVariable String gstin,

			@PathVariable String id,

			@RequestPart("data") String data,

			@RequestPart(value = "reconciliationFile1", required = false) MultipartFile reconciliationFile1,

			@RequestPart(value = "reconciliationFile2", required = false) MultipartFile reconciliationFile2,

			@RequestPart(value = "noticeFile", required = false) MultipartFile noticeFile) throws IOException {

		GstComplianceDto dto = objectMapper.readValue(data, GstComplianceDto.class);

		validateDto(dto);

		GstComplianceResponseDto response = complianceService.updateCompliance(gstin, id, dto, reconciliationFile1,
				reconciliationFile2, noticeFile);

		return ResponseEntity.ok(response);
	}

	@DeleteMapping("/{gstin}/{id}")
	public ResponseEntity<String> deleteCompliance(

			@PathVariable String gstin,

			@PathVariable String id) {

		String response = complianceService.deleteCompliance(gstin, id);

		return ResponseEntity.ok(response);
	}

	private void validateDto(GstComplianceDto dto) {

		Set<ConstraintViolation<GstComplianceDto>> violations = validator.validate(dto);

		if (!violations.isEmpty()) {

			String message = violations.stream().map(ConstraintViolation::getMessage).findFirst()
					.orElse("Invalid compliance data");

			throw new IllegalArgumentException(message);
		}
	}

	@PostMapping("/submit")
	public ResponseEntity<String> submitGstCompliance(
			@RequestParam(name = "complianceId", required = false) String complianceId,
			@RequestParam(name = "id", required = false) String id,
			@RequestParam(required = false) String pushToken) {

		String targetId = complianceId != null && !complianceId.isBlank() ? complianceId : id;
		if (targetId == null || targetId.isBlank()) {
			throw new IllegalArgumentException("complianceId is required");
		}

		return ResponseEntity.ok(complianceService.submitCompliance(targetId, pushToken));
	}
}
