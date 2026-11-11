package com.taxedge.loan.propertyloan.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.loan.propertyloan.dto.PropertyLoanCreateRequest;
import com.taxedge.loan.propertyloan.dto.PropertyLoanDocumentItemResponse;
import com.taxedge.loan.propertyloan.dto.PropertyLoanResponse;
import com.taxedge.loan.propertyloan.dto.PropertyLoanUpdateRequest;
import com.taxedge.loan.propertyloan.entity.PropertyLoanDocument;
import com.taxedge.loan.propertyloan.enums.PropertyDocumentType;
import com.taxedge.loan.propertyloan.service.PropertyLoanApplicationService;
import com.taxedge.loan.propertyloan.service.PropertyLoanDocumentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/loan/property")
@RequiredArgsConstructor
public class PropertyLoanController {

    private final PropertyLoanApplicationService applicationService;
    private final PropertyLoanDocumentService documentService;

    @PostMapping("application")
    public ResponseEntity<PropertyLoanResponse> createApplication(@RequestBody PropertyLoanCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.createApplication(request));
    }

    @GetMapping("application/{id}")
    public ResponseEntity<PropertyLoanResponse> getApplication(@PathVariable String id) {
        return ResponseEntity.ok(applicationService.getApplication(id));
    }

    @PutMapping("application/{id}")
    public ResponseEntity<PropertyLoanResponse> updateApplication(
            @PathVariable String id,
            @RequestBody PropertyLoanUpdateRequest request) {
        return ResponseEntity.ok(applicationService.updateApplication(id, request));
    }

    @DeleteMapping("application/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable String id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("application/{id}/submit")
    public ResponseEntity<PropertyLoanResponse> submitApplication(@PathVariable String id) {
        return ResponseEntity.ok(applicationService.submitApplication(id));
    }

    @GetMapping("application/my-applications")
    public ResponseEntity<List<PropertyLoanResponse>> getMyApplications() {
        return ResponseEntity.ok(applicationService.getMyApplications());
    }

    @PostMapping(value = "application/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocuments(
            @PathVariable String id,
            @RequestParam(value = "documentType", required = false) PropertyDocumentType documentType,
            @RequestParam(value = "file", required = false) MultipartFile file,
            org.springframework.web.multipart.MultipartHttpServletRequest request) {

        if (documentType != null && file != null && !file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(documentService.uploadDocument(id, documentType, file));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadDocuments(id, request.getFileMap()));
    }

    @PutMapping(value = "application/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateDocuments(
            @PathVariable String id,
            @RequestParam(value = "documentType", required = false) PropertyDocumentType documentType,
            @RequestParam(value = "file", required = false) MultipartFile file,
            org.springframework.web.multipart.MultipartHttpServletRequest request) {

        if (documentType != null && file != null && !file.isEmpty()) {
            return ResponseEntity.ok(documentService.uploadDocument(id, documentType, file));
        }

        return ResponseEntity.ok(documentService.uploadDocuments(id, request.getFileMap()));
    }

    @GetMapping("application/{id}/documents")
    public ResponseEntity<List<PropertyLoanDocumentItemResponse>> getDocuments(@PathVariable String id) {
        return ResponseEntity.ok(documentService.getDocuments(id));
    }

    @GetMapping("application/{id}/documents/{documentType}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable String id,
            @PathVariable PropertyDocumentType documentType) {
        byte[] content = documentService.downloadDocument(id, documentType);
        String fileName = documentType.name().toLowerCase() + ".pdf";
        String contentType = MediaType.APPLICATION_PDF_VALUE;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(content);
    }

    @DeleteMapping("application/{id}/documents/{documentType}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String id,
            @PathVariable PropertyDocumentType documentType) {
        documentService.deleteDocument(id, documentType);
        return ResponseEntity.noContent().build();
    }
}
