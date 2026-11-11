package com.taxedge.loan.businessloan.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ContentDisposition;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.loan.businessloan.dto.BusinessLoanApplicationDto;
import com.taxedge.loan.businessloan.dto.BusinessLoanBankingDto;
import com.taxedge.loan.businessloan.dto.BusinessLoanDocumentDto;
import com.taxedge.loan.businessloan.dto.BusinessLoanDraftDto;
import com.taxedge.loan.businessloan.dto.BusinessLoanProfileDto;
import com.taxedge.loan.businessloan.service.BusinessLoanApplicationService;
import com.taxedge.loan.businessloan.service.BusinessLoanBankingService;
import com.taxedge.loan.businessloan.service.BusinessLoanDocumentService;
import com.taxedge.loan.businessloan.service.BusinessLoanProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/loan/business")
@RequiredArgsConstructor
public class BusinessLoanController {

    private final BusinessLoanApplicationService service;

    private final BusinessLoanProfileService profileservice;

    private final BusinessLoanBankingService bankingservice;

    private final BusinessLoanDocumentService documentservice;
    
    

    @PostMapping("application/save")
    public ResponseEntity<String> save(@RequestBody BusinessLoanApplicationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.saveApplication(dto));
    }

    @GetMapping("/application/draft/current")
    public ResponseEntity<BusinessLoanDraftDto> getCurrentDraft() {
        return service.getCurrentDraft()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("application/{id}/submit")
    public ResponseEntity<String> submitDraft(@PathVariable String id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submitDraft(id));
    }

    @DeleteMapping("application/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable String id) {
        service.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("application/update/{id}")
    public ResponseEntity<String> update(@PathVariable String id,
                                         @RequestBody BusinessLoanApplicationDto dto) {
        return ResponseEntity.ok(service.updateApplication(id, dto));
    }

    @GetMapping("application/business/{id}")
    public ResponseEntity<BusinessLoanApplicationDto> get(@PathVariable String id) {
        return ResponseEntity.ok(service.getApplication(id));
    }

    @PostMapping("profile/save")
    public ResponseEntity<String> save(@RequestBody BusinessLoanProfileDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileservice.saveProfile(dto));
    }

    @PutMapping("profile/update/{loanApplicationId}")
    public ResponseEntity<String> update(@PathVariable String loanApplicationId,
                                         @RequestBody BusinessLoanProfileDto dto) {
        return ResponseEntity.ok(profileservice.updateProfile(loanApplicationId, dto));
    }

    @GetMapping("profile/{loanApplicationId}")
    public ResponseEntity<BusinessLoanProfileDto> getBusinessProfile(@PathVariable String loanApplicationId) {
        return ResponseEntity.ok(profileservice.getProfile(loanApplicationId));
    }

    @PostMapping("banking/save")
    public ResponseEntity<String> save(@RequestBody BusinessLoanBankingDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bankingservice.saveBanking(dto));
    }

    @PutMapping("banking/update/{loanApplicationId}")
    public ResponseEntity<String> update(@PathVariable String loanApplicationId,
                                         @RequestBody BusinessLoanBankingDto dto) {
        return ResponseEntity.ok(bankingservice.updateBanking(loanApplicationId, dto));
    }

    @GetMapping("banking/{loanApplicationId}")
    public ResponseEntity<BusinessLoanBankingDto> getbanking(@PathVariable String loanApplicationId) {
        return ResponseEntity.ok(bankingservice.getBanking(loanApplicationId));
    }

    @PostMapping("documents/save")
    public ResponseEntity<String> save(@RequestBody BusinessLoanDocumentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentservice.saveDocuments(dto));
    }

    @PutMapping("documents/update/{loanApplicationId}")
    public ResponseEntity<String> update(@PathVariable String loanApplicationId,
                                         @RequestBody BusinessLoanDocumentDto dto) {
        return ResponseEntity.ok(documentservice.updateDocuments(loanApplicationId, dto));
    }

    @DeleteMapping("documents/{loanApplicationId}")
    public ResponseEntity<Void> deleteDocuments(@PathVariable String loanApplicationId) {
        documentservice.deleteDocuments(loanApplicationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("documents/{loanApplicationId}")
    public ResponseEntity<BusinessLoanDocumentDto> getdocuments(@PathVariable String loanApplicationId) {
        return ResponseEntity.ok(documentservice.getDocuments(loanApplicationId));
    }

    @PutMapping(value = "documents/{loanApplicationId}/{documentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadDraftDocument(
            @PathVariable String loanApplicationId,
            @PathVariable String documentId,
            @org.springframework.web.bind.annotation.RequestPart("file") MultipartFile file) {
        documentservice.uploadDraftDocument(loanApplicationId, documentId, file);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("documents/{loanApplicationId}/{documentId}")
    public ResponseEntity<Void> removeDraftDocument(
            @PathVariable String loanApplicationId,
            @PathVariable String documentId) {
        documentservice.removeDraftDocument(loanApplicationId, documentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("documents/{loanApplicationId}/{documentId}")
    public ResponseEntity<byte[]> downloadDraftDocument(
            @PathVariable String loanApplicationId,
            @PathVariable String documentId) {
        var file = documentservice.getDraftDocument(loanApplicationId, documentId);
        MediaType contentType;
        try {
            contentType = MediaType.parseMediaType(file.getContentType());
        } catch (IllegalArgumentException ex) {
            contentType = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(file.getFileName()).build().toString())
                .body(file.getContent());
    }
}
