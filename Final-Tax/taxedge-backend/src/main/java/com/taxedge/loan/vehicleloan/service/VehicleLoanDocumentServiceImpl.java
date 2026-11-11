package com.taxedge.loan.vehicleloan.service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.taxedge.loan.vehicleloan.dto.VehicleLoanDocumentResponseDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanDocumentUploadDto;
import com.taxedge.loan.vehicleloan.entity.VehicleLoanApplication;
import com.taxedge.loan.vehicleloan.entity.VehicleLoanDocument;
import com.taxedge.loan.vehicleloan.enums.VehicleLoanApplicationStatus;
import com.taxedge.loan.vehicleloan.mapper.VehicleLoanDocumentMapper;
import com.taxedge.loan.vehicleloan.repository.VehicleLoanApplicationRepository;
import com.taxedge.loan.vehicleloan.repository.VehicleLoanDocumentRepository;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehicleLoanDocumentServiceImpl implements VehicleLoanDocumentService {

    private final VehicleLoanDocumentRepository documentRepository;
    private final VehicleLoanApplicationRepository applicationRepository;
    private final VehicleLoanDocumentMapper documentMapper;

    @Override
    @Transactional
    public VehicleLoanDocumentResponseDto uploadDocument(String vehicleLoanId, VehicleLoanDocumentUploadDto dto) {
        VehicleLoanApplication application = getOwnedApplication(vehicleLoanId);
        assertApplicationEditable(application);

        VehicleLoanDocument document = documentRepository
                .findByVehicleLoanApplication_VehicleLoanId(vehicleLoanId)
                .orElseGet(() -> VehicleLoanDocument.builder()
                        .vehicleLoanDocumentId(generateDocumentId())
                        .vehicleLoanApplication(application)
                        .build());

        dto.toMap().forEach((type, file) -> {
            try {
                document.setFileContent(type, file.getBytes());
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read file", e);
            }
        });

        VehicleLoanDocument saved = documentRepository.save(document);
        return documentMapper.toResponseDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleLoanDocumentResponseDto> getDocuments(String vehicleLoanId) {
        getOwnedApplication(vehicleLoanId);
        return documentRepository
                .findByVehicleLoanApplication_VehicleLoanId(vehicleLoanId)
                .map(documentMapper::toResponseDto)
                .map(List::of)
                .orElseGet(List::of);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] viewDocument(String vehicleLoanId, String documentType) {
        getOwnedApplication(vehicleLoanId);
        VehicleLoanDocument document = getDocument(vehicleLoanId);
        byte[] content = document.getFileContent(documentType);

        if (content == null || content.length == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file not found");
        }
        return content;
    }

    @Override
    @Transactional
    public void removeDocument(String vehicleLoanId, String documentType) {
        VehicleLoanApplication application = getOwnedApplication(vehicleLoanId);
        assertApplicationEditable(application);

        VehicleLoanDocument document = getDocument(vehicleLoanId);
        document.setFileContent(documentType, null);
        documentRepository.save(document);
    }

    @Override
    @Transactional(readOnly = true)
    public void validateRequiredDocuments(String vehicleLoanId) {
        getOwnedApplication(vehicleLoanId);
        documentRepository.findByVehicleLoanApplication_VehicleLoanId(vehicleLoanId)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Required documents are missing"));
    }

    @Override
    @Transactional
    public VehicleLoanDocumentResponseDto updateDocuments(
            String vehicleLoanId,
            VehicleLoanDocumentUploadDto dto) {

        VehicleLoanApplication application = getOwnedApplication(vehicleLoanId);
        assertApplicationEditable(application);

        VehicleLoanDocument document = getDocument(vehicleLoanId);

        if (dto == null || dto.toMap().values().stream()
                .noneMatch(file -> file != null && !file.isEmpty())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "At least one document file is required");
        }

        dto.toMap().forEach((type, file) -> {
            if (file != null && !file.isEmpty()) {
                try {
                    document.setFileContent(type, file.getBytes());
                } catch (IOException e) {
                    throw new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read file", e);
                }
            }
        });

        return documentMapper.toResponseDto(documentRepository.save(document));
    }

    private VehicleLoanApplication getOwnedApplication(String vehicleLoanId) {
        return applicationRepository
                .findByVehicleLoanIdAndCustomer_CustId(vehicleLoanId, currentCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Vehicle loan application not found: " + vehicleLoanId));
    }

    private VehicleLoanDocument getDocument(String vehicleLoanId) {
        return documentRepository
                .findByVehicleLoanApplication_VehicleLoanId(vehicleLoanId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Documents not found for this vehicle loan"));
    }

    private void assertApplicationEditable(VehicleLoanApplication application) {
        if (application.getApplicationStatus() == VehicleLoanApplicationStatus.SUBMITTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Application has already been submitted and cannot be edited");
        }
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

    private String generateDocumentId() {
        return "VLDOC" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }
}
