package com.taxedge.itr.reviseditr.controller;

import org.springframework.http.HttpStatus;
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

import com.taxedge.itr.reviseditr.dto.RevisedItrDetailsDto;
import com.taxedge.itr.reviseditr.dto.RevisedItrDocumentDto;
import com.taxedge.itr.reviseditr.dto.RevisedItrDto;
import com.taxedge.itr.reviseditr.dto.RevisionReasonDto;
import com.taxedge.itr.reviseditr.service.RevisedItrDetailsService;
import com.taxedge.itr.reviseditr.service.RevisedItrDocumentService;
import com.taxedge.itr.reviseditr.service.RevisedItrService;
import com.taxedge.itr.reviseditr.service.RevisionReasonService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/itr/revised")
@RequiredArgsConstructor
public class RevisedItrController {

	private final RevisedItrService revisedItrService;
	private final RevisedItrDetailsService revisedItrDetailsService;
	private final RevisedItrDocumentService revisedItrDocumentService;
	private final RevisionReasonService revisionReasonService;

	// =========================
	// Revised ITR
	// =========================

	@GetMapping("/{revisedItrId}")
	public ResponseEntity<RevisedItrDto> getRevisedItr(@PathVariable String revisedItrId) {

		RevisedItrDto revisedItr = revisedItrService.getRevisedItr(revisedItrId);

		return ResponseEntity.ok(revisedItr);
	}

	@PostMapping("/register")
	public ResponseEntity<String> registerRevisedItr(@Valid @RequestBody RevisedItrDto dto) {

		String result = revisedItrService.createRevisedItr(dto);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@PutMapping("/update/{revisedItrId}")
	public ResponseEntity<String> updateRevisedItr(@PathVariable String revisedItrId,
			@Valid @RequestBody RevisedItrDto dto) {

		String result = revisedItrService.updateRevisedItr(revisedItrId, dto);

		return ResponseEntity.ok(result);
	}

	@PostMapping("/submit")
	public ResponseEntity<String> submitRevisedItr(
	        @RequestParam String revisedItrId,
	        @RequestParam(required = false) String pushToken) {
	    return ResponseEntity.ok(revisedItrService.submitRevisedItr(revisedItrId, pushToken));
	}

	// =========================
	// Revision Reason
	// =========================

	@GetMapping("/reason/{revisionReasonId}")
	public ResponseEntity<RevisionReasonDto> getRevisionReason(@PathVariable String revisionReasonId) {

		RevisionReasonDto revisionReason = revisionReasonService.getRevisionReason(revisionReasonId);

		return ResponseEntity.ok(revisionReason);
	}

	@PostMapping("/reason/register")
	public ResponseEntity<String> registerRevisionReason(@Valid @RequestBody RevisionReasonDto dto) {

		String result = revisionReasonService.createRevisionReason(dto);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@PutMapping("/reason/update/{revisionReasonId}")
	public ResponseEntity<String> updateRevisionReason(@PathVariable String revisionReasonId,
			@Valid @RequestBody RevisionReasonDto dto) {

		String result = revisionReasonService.updateRevisionReason(revisionReasonId, dto);

		return ResponseEntity.ok(result);
	}

	// =========================
	// Revised ITR Details
	// =========================

	@GetMapping("/details/{detailsId}")
	public ResponseEntity<RevisedItrDetailsDto> getRevisedItrDetails(@PathVariable String detailsId) {

		RevisedItrDetailsDto details = revisedItrDetailsService.getRevisedItrDetails(detailsId);

		return ResponseEntity.ok(details);
	}

	@PostMapping("/details/register")
	public ResponseEntity<String> registerRevisedItrDetails(@Valid @RequestBody RevisedItrDetailsDto dto) {

		String result = revisedItrDetailsService.createRevisedItrDetails(dto);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@PutMapping("/details/update/{detailsId}")
	public ResponseEntity<String> updateRevisedItrDetails(@PathVariable String detailsId,
			@Valid @RequestBody RevisedItrDetailsDto dto) {

		String result = revisedItrDetailsService.updateRevisedItrDetails(detailsId, dto);

		return ResponseEntity.ok(result);
	}

	// =========================
	// Revised ITR Documents
	// =========================

	@PostMapping("/{revisedItrId}/document/register")
	public ResponseEntity<String> registerDocuments(@PathVariable String revisedItrId,
			@RequestParam(required = false) MultipartFile panCard,
			@RequestParam(required = false) MultipartFile aadhaarCard,
			@RequestParam(required = false) MultipartFile form16Form16A,
			@RequestParam(required = false) MultipartFile aisTisStatement,
			@RequestParam(required = false) MultipartFile bankStatements,
			@RequestParam(required = false) MultipartFile investmentProofs) throws Exception {

		String result = revisedItrDocumentService.registerDocuments(revisedItrId, panCard, aadhaarCard, form16Form16A,
				aisTisStatement, bankStatements, investmentProofs);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@GetMapping("/document/{documentId}")
	public ResponseEntity<RevisedItrDocumentDto> getDocuments(@PathVariable String documentId) {

		RevisedItrDocumentDto document = revisedItrDocumentService.getDocuments(documentId);

		return ResponseEntity.ok(document);
	}

	@PutMapping("/document/update/{documentId}")
	public ResponseEntity<String> updateDocuments(@PathVariable String documentId,
			@RequestParam(required = false) MultipartFile panCard,
			@RequestParam(required = false) MultipartFile aadhaarCard,
			@RequestParam(required = false) MultipartFile form16Form16A,
			@RequestParam(required = false) MultipartFile aisTisStatement,
			@RequestParam(required = false) MultipartFile bankStatements,
			@RequestParam(required = false) MultipartFile investmentProofs) throws Exception {

		String result = revisedItrDocumentService.updateDocuments(documentId, panCard, aadhaarCard, form16Form16A,
				aisTisStatement, bankStatements, investmentProofs);

		return ResponseEntity.ok(result);
	}

	@DeleteMapping("/document/delete/{documentId}")
	public ResponseEntity<String> deleteDocuments(@PathVariable String documentId) {

		String result = revisedItrDocumentService.deleteDocuments(documentId);

		return ResponseEntity.ok(result);
	}
}
