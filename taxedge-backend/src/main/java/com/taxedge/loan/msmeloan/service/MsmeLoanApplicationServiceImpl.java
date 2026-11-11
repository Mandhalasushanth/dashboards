package com.taxedge.loan.msmeloan.service;


import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.loan.msmeloan.dto.MsmeLoanApplicationDto;
import com.taxedge.loan.msmeloan.dto.MsmeLoanSubmissionRequestDto;
import com.taxedge.loan.msmeloan.dto.MsmeLoanSubmissionRequestDto.MsmeFormData;
import com.taxedge.loan.msmeloan.entity.MsmeLoanApplication;
import com.taxedge.loan.msmeloan.enums.MsmeBusinessActivity;
import com.taxedge.loan.msmeloan.enums.MsmeConstitution;
import com.taxedge.loan.msmeloan.enums.MsmeDocumentType;
import com.taxedge.loan.msmeloan.helper.MsmeLoanHelper;
import com.taxedge.loan.msmeloan.mapper.MsmeLoanApplicationMapper;
import com.taxedge.loan.msmeloan.repository.MsmeLoanApplicationRepository;
import com.taxedge.loan.msmeloan.repository.MsmeLoanDocumentRepository;
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MsmeLoanApplicationServiceImpl implements MsmeLoanApplicationService {

    private final MsmeLoanApplicationRepository repository;
    private final MsmeLoanDocumentRepository documentRepository;
    private final CustomerRepository customerRepository;
    private final MsmeLoanApplicationMapper mapper;
    private final MsmeLoanDocumentService documentService;

    @Override
    @Transactional
    public MsmeLoanApplicationDto saveApplication(MsmeLoanApplicationDto dto) {
        String customerId = currentCustomerId();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated customer not found: " + customerId));

        MsmeLoanApplication entity = mapper.toEntity(dto);
        if (!StringUtils.hasText(entity.getId())) {
            int year = java.time.Year.now().getValue();
            entity.setId(MsmeLoanHelper.generateLoanApplicationId(year));
        }
        entity.setCustomer(customer);
        entity.setStatus(LoanApplicationStatus.DRAFT);

        MsmeLoanApplication saved = repository.save(entity);
        log.info("Created MSME loan application {} for customer {}", saved.getId(), customerId);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public MsmeLoanApplicationDto submitApplication(
            MsmeLoanSubmissionRequestDto request,
            MultipartFile udyamCertificate,
            MultipartFile gstCertificate) {
        MsmeFormData form = request.getMsmeFormData();
        boolean udyamRegistered = isRegistered(form.getUdyamStatus());
        boolean gstRegistered = isRegistered(form.getGstStatus());
        if (udyamRegistered && (udyamCertificate == null || udyamCertificate.isEmpty())) {
            throw new IllegalArgumentException("Udyam certificate is required for registered businesses");
        }
        if (gstRegistered && (gstCertificate == null || gstCertificate.isEmpty())) {
            throw new IllegalArgumentException("GST certificate is required for registered businesses");
        }

        MsmeLoanApplicationDto dto = toApplicationDto(form);
        MsmeLoanApplicationDto saved = saveApplication(dto);
        if (udyamCertificate != null && !udyamCertificate.isEmpty()) {
            documentService.uploadDocument(
                    saved.getId(), MsmeDocumentType.UDYAM_CERTIFICATE, udyamCertificate);
        }
        if (gstCertificate != null && !gstCertificate.isEmpty()) {
            documentService.uploadDocument(
                    saved.getId(), MsmeDocumentType.GST_CERTIFICATE, gstCertificate);
        }

        MsmeLoanApplication entity = findOrThrow(saved.getId());
        entity.setStatus(LoanApplicationStatus.SUBMITTED);
        MsmeLoanApplication submitted = repository.save(entity);
        log.info("Submitted MSME loan application {} for customer {}", submitted.getId(), currentCustomerId());
        return mapper.toDto(submitted);
    }

    @Override
    @Transactional
    public MsmeLoanApplicationDto updateApplication(String id, MsmeLoanApplicationDto dto) {
        MsmeLoanApplication entity = findOrThrow(id);
        if (entity.getStatus() == LoanApplicationStatus.SUBMITTED || entity.getStatus() == LoanApplicationStatus.APPROVED) {
            throw new IllegalStateException("Submitted or approved MSME loan applications cannot be edited");
        }

        LoanApplicationStatus currentStatus = entity.getStatus();
        mapper.updateFromDto(dto, entity);
        entity.setStatus(currentStatus);

        log.info("Updated MSME loan application: {}", id);
        return mapper.toDto(entity);
    }

    private MsmeLoanApplicationDto toApplicationDto(MsmeFormData form) {
        java.math.BigDecimal requestedLoanAmount =
                new java.math.BigDecimal(form.getRequestedLoanAmount());
        if (requestedLoanAmount.compareTo(new java.math.BigDecimal("50000")) < 0) {
            throw new IllegalArgumentException("Requested loan amount must be at least 50000");
        }
        if (new java.math.BigDecimal(form.getAnnualTurnover()).signum() <= 0) {
            throw new IllegalArgumentException("Annual turnover must be greater than zero");
        }
        if (Integer.parseInt(form.getNumberOfEmployees()) > 50000) {
            throw new IllegalArgumentException("Number of employees cannot exceed 50000");
        }
        if ("Other".equals(form.getConstitution())
                && !StringUtils.hasText(form.getConstitutionOther())) {
            throw new IllegalArgumentException("Please specify the business constitution");
        }
        if ("Other".equals(form.getBusinessActivity())
                && !StringUtils.hasText(form.getBusinessActivityOther())) {
            throw new IllegalArgumentException("Please specify the business activity");
        }
        if ("Other".equals(form.getOwnershipType())
                && !StringUtils.hasText(form.getOwnershipTypeOther())) {
            throw new IllegalArgumentException("Please specify the ownership type");
        }

        return MsmeLoanApplicationDto.builder()
                .businessName(form.getBusinessName())
                .constitution(toConstitution(form.getConstitution()))
                .constitutionOther(form.getConstitutionOther())
                .businessActivity(toBusinessActivity(form.getBusinessActivity()))
                .businessActivityOther(form.getBusinessActivityOther())
                .requestedLoanAmount(requestedLoanAmount)
                .annualTurnover(new java.math.BigDecimal(form.getAnnualTurnover()))
                .yearsInBusiness(form.getOperatingDuration())
                .establishmentDate(form.getEstablishmentDate())
                .operatingAddress(new MsmeLoanApplicationDto.OperatingAddress(
                        form.getOperatingAddress().getHouseNumber(),
                        form.getOperatingAddress().getStreet(),
                        form.getOperatingAddress().getCity(),
                        form.getOperatingAddress().getState(),
                        form.getOperatingAddress().getPincode()))
                .numberOfEmployees(form.getNumberOfEmployees())
                .ownershipType(form.getOwnershipType())
                .ownershipTypeOther(form.getOwnershipTypeOther())
                .udyamStatus(form.getUdyamStatus())
                .udyamRegistrationNumber(form.getUdyamRegistrationNumber())
                .gstStatus(form.getGstStatus())
                .gstin(form.getGstin())
                .build();
    }

    private MsmeConstitution toConstitution(String value) {
        return switch (value.trim()) {
            case "Proprietorship" -> MsmeConstitution.PROPRIETORSHIP;
            case "Partnership", "Partnership Firm" -> MsmeConstitution.PARTNERSHIP;
            case "LLP", "Limited Liability Partnership (LLP)" -> MsmeConstitution.LLP;
            case "Private Limited Company" -> MsmeConstitution.PVT_LTD;
            case "Public Limited Company" -> MsmeConstitution.PUBLIC_LTD;
            case "One Person Company" -> MsmeConstitution.ONE_PERSON_COMPANY;
            case "Other" -> MsmeConstitution.OTHER;
            default -> throw new IllegalArgumentException("Unsupported business constitution");
        };
    }

    private MsmeBusinessActivity toBusinessActivity(String value) {
        return switch (value.trim()) {
            case "Manufacturing" -> MsmeBusinessActivity.MANUFACTURING;
            case "Service" -> MsmeBusinessActivity.SERVICE;
            case "Service Provider" -> MsmeBusinessActivity.SERVICE_PROVIDER;
            case "Trading" -> MsmeBusinessActivity.TRADING;
            case "Wholesale Trading" -> MsmeBusinessActivity.WHOLESALE_TRADING;
            case "Retail Trading" -> MsmeBusinessActivity.RETAIL_TRADING;
            case "IT / Software Services" -> MsmeBusinessActivity.IT_SOFTWARE_SERVICES;
            case "Food & Agro Processing" -> MsmeBusinessActivity.FOOD_AGRO_PROCESSING;
            case "Textiles & Apparel" -> MsmeBusinessActivity.TEXTILES_APPAREL;
            case "Automotive & Engineering" -> MsmeBusinessActivity.AUTOMOTIVE_ENGINEERING;
            case "Other" -> MsmeBusinessActivity.OTHER;
            default -> throw new IllegalArgumentException("Unsupported business activity");
        };
    }

    private boolean isRegistered(String value) {
        return "registered".equalsIgnoreCase(value.trim()) || "yes".equalsIgnoreCase(value.trim());
    }

    @Override
    public MsmeLoanApplicationDto getApplication(String id) {
        return mapper.toDto(findOrThrow(id));
    }

    @Override
    public List<MsmeLoanApplicationDto> getMyApplications() {
        return repository.findByCustomer_CustIdOrderByCreatedAtDesc(currentCustomerId())
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteApplication(String id) {
        MsmeLoanApplication entity = findOrThrow(id);
        if (entity.getStatus() == LoanApplicationStatus.SUBMITTED || entity.getStatus() == LoanApplicationStatus.APPROVED) {
            throw new IllegalStateException("Submitted or approved MSME loan applications cannot be deleted");
        }
        documentRepository.deleteByLoanApplication_Id(entity.getId());
        repository.delete(entity);
        log.info("Deleted MSME loan application {} and associated documents", id);
    }

    private MsmeLoanApplication findOrThrow(String id) {
        if (!StringUtils.hasText(id)) {
            throw new IllegalArgumentException("MSME loan application ID is required");
        }
        return repository.findByIdAndCustomer_CustId(id.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("MSME loan application not found: " + id));
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
