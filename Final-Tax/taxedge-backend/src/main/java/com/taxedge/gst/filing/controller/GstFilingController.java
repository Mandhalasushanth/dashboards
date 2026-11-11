package com.taxedge.gst.filing.controller;

import java.io.IOException;

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

import com.taxedge.gst.filing.dto.GstFilingDocumentsDto;
import com.taxedge.gst.filing.dto.GstFilingDto;
import com.taxedge.gst.filing.service.GstFilingDocumentsService;
import com.taxedge.gst.filing.service.GstFilingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/gst/filing")
@RequiredArgsConstructor
public class GstFilingController {

	private final GstFilingService gstFilingService;

	private final GstFilingDocumentsService documentsService;

	@PostMapping("/create")
	public ResponseEntity<String> createFiling(@Valid @RequestBody GstFilingDto gstFilingDto) {

		String result = gstFilingService.createFiling(gstFilingDto);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@GetMapping("/{id}")
	public ResponseEntity<GstFilingDto> getFilingById(@PathVariable String id) {

		GstFilingDto filing = gstFilingService.getFilingById(id);

		return ResponseEntity.ok(filing);
	}

	@PutMapping("/update/{id}")
	public ResponseEntity<String> updateFiling(@PathVariable String id, @Valid @RequestBody GstFilingDto gstFilingDto) {

		String result = gstFilingService.updateFiling(id, gstFilingDto);

		return ResponseEntity.ok(result);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteFiling(@PathVariable String id) {

		String result = gstFilingService.deleteFiling(id);

		return ResponseEntity.ok(result);
	}

	@PostMapping("/documents/{gstfilingId}/upload")
	public ResponseEntity<String> uploadDocuments(@PathVariable String gstfilingId,
			@RequestParam(value = "salesInvoice", required = false) MultipartFile salesInvoice,
			@RequestParam(value = "purchaseInvoices", required = false) MultipartFile purchaseInvoices,
			@RequestParam(value = "gstr2bItcStatement", required = false) MultipartFile gstr2bItcStatement,
			@RequestParam(value = "creditNotes", required = false) MultipartFile creditNotes,
			@RequestParam(value = "debitNotes", required = false) MultipartFile debitNotes,
			@RequestParam(value = "eInvoiceData", required = false) MultipartFile eInvoiceData,
			@RequestParam(value = "eWayBillData", required = false) MultipartFile eWayBillData,
			@RequestParam(value = "expenseInvoicesAndVouchers", required = false) MultipartFile expenseInvoicesAndVouchers,
			@RequestParam(value = "bankStatement", required = false) MultipartFile bankStatement,
			@RequestParam(value = "previousGstReturns", required = false) MultipartFile previousGstReturns,
			@RequestParam(value = "previousFilingAcknowledgement", required = false) MultipartFile previousFilingAcknowledgement,
			@RequestParam(value = "otherSupportingDocuments", required = false) MultipartFile otherSupportingDocuments)
			throws IOException {

		String result = documentsService.uploadDocuments(gstfilingId, salesInvoice, purchaseInvoices,
				gstr2bItcStatement, creditNotes, debitNotes, eInvoiceData, eWayBillData, expenseInvoicesAndVouchers,
				bankStatement, previousGstReturns, previousFilingAcknowledgement, otherSupportingDocuments);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@GetMapping("/documents/{gstfilingId}")
	public ResponseEntity<GstFilingDocumentsDto> getDocuments(@PathVariable String gstfilingId) {

		GstFilingDocumentsDto documents = documentsService.getDocuments(gstfilingId);

		return ResponseEntity.ok(documents);
	}

	@PutMapping("/documents/{gstfilingId}/update")
	public ResponseEntity<String> updateDocuments(@PathVariable String gstfilingId,
			@RequestParam(value = "salesInvoice", required = false) MultipartFile salesInvoice,
			@RequestParam(value = "purchaseInvoices", required = false) MultipartFile purchaseInvoices,
			@RequestParam(value = "gstr2bItcStatement", required = false) MultipartFile gstr2bItcStatement,
			@RequestParam(value = "creditNotes", required = false) MultipartFile creditNotes,
			@RequestParam(value = "debitNotes", required = false) MultipartFile debitNotes,
			@RequestParam(value = "eInvoiceData", required = false) MultipartFile eInvoiceData,
			@RequestParam(value = "eWayBillData", required = false) MultipartFile eWayBillData,
			@RequestParam(value = "expenseInvoicesAndVouchers", required = false) MultipartFile expenseInvoicesAndVouchers,
			@RequestParam(value = "bankStatement", required = false) MultipartFile bankStatement,
			@RequestParam(value = "previousGstReturns", required = false) MultipartFile previousGstReturns,
			@RequestParam(value = "previousFilingAcknowledgement", required = false) MultipartFile previousFilingAcknowledgement,
			@RequestParam(value = "otherSupportingDocuments", required = false) MultipartFile otherSupportingDocuments)
			throws IOException {

		String result = documentsService.updateDocuments(gstfilingId, salesInvoice, purchaseInvoices,
				gstr2bItcStatement, creditNotes, debitNotes, eInvoiceData, eWayBillData, expenseInvoicesAndVouchers,
				bankStatement, previousGstReturns, previousFilingAcknowledgement, otherSupportingDocuments);

		return ResponseEntity.ok(result);
	}

	@DeleteMapping("/documents/{gstfilingId}")
	public ResponseEntity<String> deleteDocuments(@PathVariable String gstfilingId) {

		String result = documentsService.deleteDocuments(gstfilingId);

		return ResponseEntity.ok(result);
	}

	@PostMapping("/submit")
	public ResponseEntity<String> submitGstFiling(
			@RequestParam(name = "filingId", required = false) String filingId,
			@RequestParam(name = "gstfilingId", required = false) String gstfilingId,
			@RequestParam(required = false) String pushToken) {

		String targetId = filingId != null && !filingId.isBlank() ? filingId : gstfilingId;
		if (targetId == null || targetId.isBlank()) {
			throw new IllegalArgumentException("filingId is required");
		}

		return ResponseEntity.ok(gstFilingService.submitFiling(targetId, pushToken));
	}
}
