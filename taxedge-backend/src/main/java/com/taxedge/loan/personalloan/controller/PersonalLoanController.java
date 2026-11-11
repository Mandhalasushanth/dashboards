package com.taxedge.loan.personalloan.controller;

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

import java.util.List;

import com.taxedge.loan.personalloan.dto.PersonalLoanApplicationDto;
import com.taxedge.loan.personalloan.dto.PersonalLoanDocumentDto;
import com.taxedge.loan.personalloan.service.PersonalLoanApplicationService;
import com.taxedge.loan.personalloan.service.PersonalLoanDocumentService;
import com.taxedge.loan.personalloan.service.PersonalLoanSubmissionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/loan/personal")
@RequiredArgsConstructor
public class PersonalLoanController {

    private final PersonalLoanApplicationService service;

    private final PersonalLoanDocumentService documentService;

    private final PersonalLoanSubmissionService submissionService;

    @PostMapping("application/save")
    public ResponseEntity<PersonalLoanApplicationDto> save(
            @Valid @RequestBody PersonalLoanApplicationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.saveApplication(dto));
    }

    @PostMapping(value = "application/save-with-documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PersonalLoanApplicationDto> saveWithDocuments(
            @Valid @RequestPart("application") PersonalLoanApplicationDto dto,
            @RequestPart(value = "panCardFile", required = false) MultipartFile panCardFile,
            @RequestPart(value = "bankStatementsFile", required = false) MultipartFile bankStatementsFile,
            @RequestPart(value = "itrAcknowledgmentFile", required = false) MultipartFile itrAcknowledgmentFile) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submit(dto, panCardFile, bankStatementsFile, itrAcknowledgmentFile));
    }

    @DeleteMapping("application/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable String id) {
        service.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("application/update/{id}")
    public ResponseEntity<PersonalLoanApplicationDto> update(
            @PathVariable String id,
            @Valid @RequestBody PersonalLoanApplicationDto dto) {
        return ResponseEntity.ok(service.updateApplication(id, dto));
    }

    @GetMapping("application/my-applications")
    public ResponseEntity<List<PersonalLoanApplicationDto>> getMine() {
        return ResponseEntity.ok(service.getMyApplications());
    }

    @GetMapping("application/{id}")
    public ResponseEntity<PersonalLoanApplicationDto> get(@PathVariable String id) {
        return ResponseEntity.ok(service.getApplication(id));
    }

    @PostMapping(value = "documents/save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> saveDocuments(
            @RequestParam("loanApplicationId") String loanApplicationId,
            @RequestPart(value = "panCardFile",       required = false) MultipartFile panCardFile,
            @RequestPart(value = "aadhaarCardFile",   required = false) MultipartFile aadhaarCardFile,
            @RequestPart(value = "addressProofFile",  required = false) MultipartFile addressProofFile,
            @RequestPart(value = "photographFile",    required = false) MultipartFile photographFile,
            @RequestPart(value = "bankStatementsFile",required = false) MultipartFile bankStatementsFile,
            @RequestPart(value = "salarySlipsFile",   required = false) MultipartFile salarySlipsFile,
            @RequestPart(value = "itrAcknowledgmentFile", required = false) MultipartFile itrAcknowledgmentFile) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.saveDocuments(loanApplicationId, panCardFile,
                        aadhaarCardFile, addressProofFile, photographFile,
                        bankStatementsFile, salarySlipsFile, itrAcknowledgmentFile));
    }

    @PutMapping(value = "documents/update/{loanApplicationId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateDocuments(
            @PathVariable String loanApplicationId,
            @RequestPart(value = "panCardFile",       required = false) MultipartFile panCardFile,
            @RequestPart(value = "aadhaarCardFile",   required = false) MultipartFile aadhaarCardFile,
            @RequestPart(value = "addressProofFile",  required = false) MultipartFile addressProofFile,
            @RequestPart(value = "photographFile",    required = false) MultipartFile photographFile,
            @RequestPart(value = "bankStatementsFile",required = false) MultipartFile bankStatementsFile,
            @RequestPart(value = "salarySlipsFile",   required = false) MultipartFile salarySlipsFile,
            @RequestPart(value = "itrAcknowledgmentFile", required = false) MultipartFile itrAcknowledgmentFile) {

        return ResponseEntity.ok(documentService.updateDocuments(loanApplicationId, panCardFile,
                aadhaarCardFile, addressProofFile, photographFile,
                bankStatementsFile, salarySlipsFile, itrAcknowledgmentFile));
    }

    @GetMapping("documents/{loanApplicationId}")
    public ResponseEntity<PersonalLoanDocumentDto> getDocuments(@PathVariable String loanApplicationId) {
        return ResponseEntity.ok(documentService.getDocuments(loanApplicationId));
    }

    /**
     * Download a specific document file as raw binary.
     * fileType values: pancardfile | aadhaarcard | addressproof | photograph | bankstatements | salaryslips
     * Example: GET /loan/personal/documents/PLN-001/download/photograph
     */
    @DeleteMapping("documents/{loanApplicationId}/{fileType}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String loanApplicationId,
            @PathVariable String fileType) {
        documentService.deleteDocument(loanApplicationId, fileType);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("documents/{loanApplicationId}")
    public ResponseEntity<Void> deleteAllDocuments(@PathVariable String loanApplicationId) {
        documentService.deleteAllDocuments(loanApplicationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("documents/{loanApplicationId}/download/{fileType}")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable String loanApplicationId,
            @PathVariable String fileType) {

        byte[] data = documentService.downloadFile(loanApplicationId, fileType);

        if (data == null || data.length == 0) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "inline; filename=\"" + fileType + "_" + loanApplicationId + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(data.length)
                .body(data);
    }
}
