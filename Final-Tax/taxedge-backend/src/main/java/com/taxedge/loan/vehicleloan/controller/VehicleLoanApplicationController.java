package com.taxedge.loan.vehicleloan.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.loan.vehicleloan.dto.VehicleLoanCreateRequest;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanDetailsDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanDocumentResponseDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanDocumentUploadDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanKycResponseDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanResponse;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanUpdateRequest;
import com.taxedge.loan.vehicleloan.service.VehicleLoanApplicationService;
import com.taxedge.loan.vehicleloan.service.VehicleLoanDocumentService;
import com.taxedge.security.jwt.JwtPrincipal;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/loan/vehicle-loan")
@RequiredArgsConstructor
public class VehicleLoanApplicationController {

    private final VehicleLoanApplicationService applicationService;
    private final VehicleLoanDocumentService documentService;

    @PostMapping("application")
    public ResponseEntity<VehicleLoanResponse> createApplication(
            @Valid @RequestBody VehicleLoanCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.createApplication(request));
    }

    @GetMapping("application/{id}")
    public ResponseEntity<VehicleLoanResponse> getVehicleLoan(
            @PathVariable String id) {
        return ResponseEntity.ok(applicationService.getVehicleLoan(id));
    }

    @PutMapping("application/{id}")
    public ResponseEntity<VehicleLoanResponse> updateVehicleLoan(
            @PathVariable String id,
            @Valid @RequestBody VehicleLoanUpdateRequest request) {
        return ResponseEntity.ok(applicationService.updateVehicleLoan(id, request));
    }

    @DeleteMapping("application/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable String id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("application/{id}/submit")
    public ResponseEntity<VehicleLoanResponse> submitApplication(
            @PathVariable String id) {
        return ResponseEntity.ok(applicationService.submitApplication(id));
    }

    @GetMapping("application/my-applications")
    public ResponseEntity<List<VehicleLoanResponse>> getMyApplications() {
        return ResponseEntity.ok(applicationService.getMyApplications());
    }

    @PostMapping(value = "application/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VehicleLoanDocumentResponseDto> uploadDocument(
            @PathVariable String id,
            @ModelAttribute VehicleLoanDocumentUploadDto dto) {
        VehicleLoanDocumentResponseDto response = documentService.uploadDocument(id, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("application/{id}/documents")
    public ResponseEntity<List<VehicleLoanDocumentResponseDto>> getDocuments(
            @PathVariable String id) {
        return ResponseEntity.ok(documentService.getDocuments(id));
    }

    @GetMapping("application/{id}/documents/{documentType}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable String id,
            @PathVariable String documentType) {
        byte[] content = documentService.viewDocument(id, documentType);
        String fileName = documentType.toLowerCase() + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(content);
    }

    @DeleteMapping("application/{id}/documents/{documentType}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable String id,
            @PathVariable String documentType) {
        documentService.removeDocument(id, documentType);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/kyc/{customerId}")
    public ResponseEntity<VehicleLoanKycResponseDto> getKycDetails(
            @PathVariable String customerId) {
        String authCustId = currentCustomerId();
        if (StringUtils.hasText(customerId) && !"me".equalsIgnoreCase(customerId.trim())
                && !customerId.trim().equals(authCustId)) {
            throw new AccessDeniedException("Access denied: You cannot view KYC details of another customer");
        }
        return ResponseEntity.ok(applicationService.getKycDetails(authCustId));
    }

    @PostMapping("/applications")
    public ResponseEntity<VehicleLoanResponse> startApplicationLegacy(
            @Valid @RequestBody(required = false) VehicleLoanCreateRequest request) {
        if (request == null) {
            request = new VehicleLoanCreateRequest();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.createApplication(request));
    }

    @GetMapping("/applications/{vehicleLoanId}")
    public ResponseEntity<VehicleLoanResponse> getApplicationLegacy(
            @PathVariable String vehicleLoanId) {
        return ResponseEntity.ok(applicationService.getVehicleLoan(vehicleLoanId));
    }

    @PostMapping("/{vehicleLoanId}/vehicle-details")
    public ResponseEntity<VehicleLoanResponse> createVehicleDetailsLegacy(
            @PathVariable String vehicleLoanId,
            @Valid @RequestBody VehicleLoanUpdateRequest dto) {
        return ResponseEntity.ok(applicationService.updateVehicleLoan(vehicleLoanId, dto));
    }

    @GetMapping("/{vehicleLoanId}/vehicle-details")
    public ResponseEntity<VehicleLoanResponse> getVehicleDetailsLegacy(
            @PathVariable String vehicleLoanId) {
        return ResponseEntity.ok(applicationService.getVehicleLoan(vehicleLoanId));
    }

    @PutMapping("/{vehicleLoanId}/vehicle-details/{detailsId}")
    public ResponseEntity<VehicleLoanResponse> updateVehicleDetailsLegacy(
            @PathVariable String vehicleLoanId,
            @PathVariable String detailsId,
            @Valid @RequestBody VehicleLoanUpdateRequest dto) {
        return ResponseEntity.ok(applicationService.updateVehicleLoan(vehicleLoanId, dto));
    }

    @PostMapping("/applications/{vehicleLoanId}/vehicle-details/{detailsId}/documents")
    public ResponseEntity<VehicleLoanDocumentResponseDto> updateAndContinueLegacy(
            @PathVariable String vehicleLoanId,
            @PathVariable String detailsId,
            @ModelAttribute VehicleLoanDocumentUploadDto dto) {
        return ResponseEntity.ok(documentService.uploadDocument(vehicleLoanId, dto));
    }

    @PutMapping(value = "/application/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VehicleLoanDocumentResponseDto> updateDocuments(
            @PathVariable("id") String vehicleLoanId,
            @ModelAttribute VehicleLoanDocumentUploadDto dto) {

        return ResponseEntity.ok(
                documentService.updateDocuments(vehicleLoanId, dto));
    }

    @DeleteMapping("/applications/{vehicleLoanId}/vehicle-details/{detailsId}/documents/{documentType}")
    public ResponseEntity<Void> removeDocumentLegacy(
            @PathVariable String vehicleLoanId,
            @PathVariable String detailsId,
            @PathVariable String documentType) {
        documentService.removeDocument(vehicleLoanId, documentType);
        return ResponseEntity.noContent().build();
    }

    private String currentCustomerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof JwtPrincipal principal)
                || !StringUtils.hasText(principal.custId())) {
            throw new AccessDeniedException("An authenticated customer is required");
        }
        return principal.custId();
    }
}
