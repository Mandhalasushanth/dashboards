package com.taxedge.itr.filing.controller;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.itr.filing.dto.DocumentDto;
import com.taxedge.itr.filing.dto.ItrFilingPostDto;
import com.taxedge.itr.filing.dto.SalaryIncomeDto;
import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.itr.filing.service.ItrDocumentService;
import com.taxedge.itr.filing.service.ItrFilingService;
import com.taxedge.itr.filing.service.SalaryIncomeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/itr")
@RequiredArgsConstructor
public class ItrFilingController {

	private final ItrFilingService itrFilingService;

	private final ItrDocumentService itrDocumentService;

	private final SalaryIncomeService salaryIncomeService;

	// ==========================================
	// 1. ITR FILING ENDPOINTS
	// ==========================================

	@GetMapping("/filing/{itrId}")
	public ResponseEntity<ItrFiling> getItrFiling(@PathVariable String itrId) {

		ItrFiling itrFiling = itrFilingService.getItrFiling(itrId);

		return ResponseEntity.ok(itrFiling);
	}

	@PostMapping("/filing/register")
	public ResponseEntity<String> registerItrFiling(@Valid @RequestBody ItrFilingPostDto dto) {

		String result = itrFilingService.createItrFiling(dto);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@PutMapping("/filing/update/{itrId}")
	public ResponseEntity<String> updateItrFiling(@PathVariable String itrId,
			@Valid @RequestBody ItrFilingPostDto dto) {

		String result = itrFilingService.updateItrFiling(itrId, dto);

		return ResponseEntity.ok(result);
	}

	@PostMapping("/submit")
	public ResponseEntity<String> submitItrFiling(
	        @RequestParam String itrId,
	        @RequestParam(required = false) String pushToken) {
	    return ResponseEntity.ok(itrFilingService.submitItrFiling(itrId, pushToken));
	}

	// ==========================================
	// 2. ITR DOCUMENT ENDPOINTS
	// ==========================================

	@PostMapping("/{itrId}/documents/register")
	public ResponseEntity<String> registerDocuments(@PathVariable String itrId,
			@RequestParam(value = "form16PartAPartB", required = false) MultipartFile form16PartAPartB,
			@RequestParam(value = "form26as", required = false) MultipartFile form26as,
			@RequestParam(value = "aisTis", required = false) MultipartFile aisTis,
			@RequestParam(value = "bankAccountStatement", required = false) MultipartFile bankAccountStatement,
			@RequestParam(value = "salaryPayslips", required = false) MultipartFile salaryPayslips,
			@RequestParam(value = "capitalGainsStatement", required = false) MultipartFile capitalGainsStatement,
			@RequestParam(value = "businessTurnover", required = false) MultipartFile businessTurnover) throws IOException {

		String result = itrDocumentService.registerDocuments(itrId, form16PartAPartB, form26as, aisTis,
				bankAccountStatement, salaryPayslips, capitalGainsStatement, businessTurnover);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@GetMapping("/documents/{documentId}")
	public ResponseEntity<DocumentDto> getDocuments(@PathVariable String documentId) {

		DocumentDto documents = itrDocumentService.getDocuments(documentId);

		return ResponseEntity.ok(documents);
	}

	@PutMapping("/documents/update/{documentId}")
	public ResponseEntity<String> updateDocuments(@PathVariable String documentId,
			@RequestParam(value = "form16PartAPartB", required = false) MultipartFile form16PartAPartB,
			@RequestParam(value = "form26as", required = false) MultipartFile form26as,
			@RequestParam(value = "aisTis", required = false) MultipartFile aisTis,
			@RequestParam(value = "bankAccountStatement", required = false) MultipartFile bankAccountStatement,
			@RequestParam(value = "salaryPayslips", required = false) MultipartFile salaryPayslips,
			@RequestParam(value = "capitalGainsStatement", required = false) MultipartFile capitalGainsStatement,
			@RequestParam(value = "businessTurnover", required = false) MultipartFile businessTurnover) throws IOException {

		String result = itrDocumentService.updateDocuments(documentId, form16PartAPartB, form26as, aisTis,
				bankAccountStatement, salaryPayslips, capitalGainsStatement, businessTurnover);

		return ResponseEntity.ok(result);
	}

	@DeleteMapping("/documents/{documentId}")
	public ResponseEntity<String> deleteDocuments(@PathVariable String documentId) {

		String result = itrDocumentService.deleteDocuments(documentId);

		return ResponseEntity.ok(result);
	}

	// ==========================================
	// 3. SALARY INCOME ENDPOINTS
	// ==========================================

	@PostMapping("/{itrId}/salary-income/register")
	public ResponseEntity<String> registerSalaryIncome(@PathVariable String itrId,
			@Valid @RequestBody SalaryIncomeDto salaryIncomeDto) {

		String result = salaryIncomeService.registerSalaryIncome(itrId, salaryIncomeDto);

		return new ResponseEntity<>(result, HttpStatus.CREATED);
	}

	@GetMapping("/salary-income/{incomeId}")
	public ResponseEntity<SalaryIncomeDto> getSalaryIncome(@PathVariable String incomeId) {

		SalaryIncomeDto salaryIncome = salaryIncomeService.getSalaryIncome(incomeId);

		return ResponseEntity.ok(salaryIncome);
	}

	@PutMapping("/salary-income/update/{incomeId}")
	public ResponseEntity<String> updateSalaryIncome(@PathVariable String incomeId,
			@Valid @RequestBody SalaryIncomeDto salaryIncomeDto) {

		String result = salaryIncomeService.updateSalaryIncome(incomeId, salaryIncomeDto);

		return ResponseEntity.ok(result);
	}

	@DeleteMapping("/salary-income/{incomeId}")
	public ResponseEntity<String> deleteSalaryIncome(@PathVariable String incomeId) {

		String result = salaryIncomeService.deleteSalaryIncome(incomeId);

		return ResponseEntity.ok(result);
	}
}
