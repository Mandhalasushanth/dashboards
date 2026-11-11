package com.taxedge.loan.msmeloan.controller;

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

import com.taxedge.loan.msmeloan.dto.MsmeLoanApplicationDto;
import com.taxedge.loan.msmeloan.dto.MsmeLoanDocumentItemResponse;
import com.taxedge.loan.msmeloan.dto.MsmeLoanSubmissionRequestDto;
import com.taxedge.loan.msmeloan.enums.MsmeDocumentType;
import com.taxedge.loan.msmeloan.service.MsmeLoanApplicationService;
import com.taxedge.loan.msmeloan.service.MsmeLoanDocumentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/loan/msme")
@RequiredArgsConstructor
public class MsmeLoanApplicationController {

    private final MsmeLoanApplicationService service;
    private final MsmeLoanDocumentService documentService;

    @PostMapping("application/save")
    public ResponseEntity<MsmeLoanApplicationDto> save(
            @Valid @RequestBody MsmeLoanApplicationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.saveApplication(dto));
    }

    @PostMapping(value = "application", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MsmeLoanApplicationDto> submit(
            @Valid @RequestPart("application") MsmeLoanSubmissionRequestDto request,
            @RequestPart(value = "udyamCertificate", required = false) MultipartFile udyamCertificate,
            @RequestPart(value = "gstCertificate", required = false) MultipartFile gstCertificate) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.submitApplication(request, udyamCertificate, gstCertificate));
    }

    @PutMapping("application/update/{id}")
    public ResponseEntity<MsmeLoanApplicationDto> update(
            @PathVariable String id,
            @Valid @RequestBody MsmeLoanApplicationDto dto) {
        return ResponseEntity.ok(service.updateApplication(id, dto));
    }

    @GetMapping("application/{id}")
    public ResponseEntity<MsmeLoanApplicationDto> get(@PathVariable String id) {
        return ResponseEntity.ok(service.getApplication(id));
    }

    @GetMapping("application/my-applications")
    public ResponseEntity<List<MsmeLoanApplicationDto>> getMine() {
        return ResponseEntity.ok(service.getMyApplications());
    }

    @DeleteMapping("application/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable String id) {
        service.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "application/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocuments(
            @PathVariable String id,
            @RequestParam(value = "documentType", required = false) MsmeDocumentType documentType,
            @RequestParam(value = "file", required = false) MultipartFile file,
            org.springframework.web.multipart.MultipartHttpServletRequest request) {

        if (documentType != null) {
            MultipartFile targetFile = file;
            if (targetFile == null || targetFile.isEmpty()) {
                targetFile = request.getFile(documentType.name());
                if (targetFile == null || targetFile.isEmpty()) {
                    targetFile = request.getFile(documentType.getKey());
                }
                if ((targetFile == null || targetFile.isEmpty()) && request.getFileMap().size() == 1) {
                    targetFile = request.getFileMap().values().iterator().next();
                }
            }
            if (targetFile != null && !targetFile.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CREATED)
                        .body(documentService.uploadDocument(id, documentType, targetFile));
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadDocuments(id, request.getFileMap()));
    }

    @PutMapping(value = "application/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateDocuments(
            @PathVariable String id,
            @RequestParam(value = "documentType", required = false) MsmeDocumentType documentType,
            @RequestParam(value = "file", required = false) MultipartFile file,
            org.springframework.web.multipart.MultipartHttpServletRequest request) {
        return uploadDocuments(id, documentType, file, request);
    }

    @GetMapping("application/{id}/documents")
    public ResponseEntity<List<MsmeLoanDocumentItemResponse>> getDocuments(@PathVariable String id) {
        return ResponseEntity.ok(documentService.getDocuments(id));
    }

    @GetMapping("application/{id}/documents/{documentType}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable String id,
            @PathVariable MsmeDocumentType documentType) {
        byte[] content = documentService.downloadDocument(id, documentType);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + documentType.name().toLowerCase() + ".pdf\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(content);
    }

    @DeleteMapping("application/{id}/documents/{documentType}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String id,
            @PathVariable MsmeDocumentType documentType) {
        documentService.deleteDocument(id, documentType);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("application/{id}/documents")
    public ResponseEntity<Void> deleteAllDocuments(@PathVariable String id) {
        documentService.deleteAllDocuments(id);
        return ResponseEntity.noContent().build();
    }
}
