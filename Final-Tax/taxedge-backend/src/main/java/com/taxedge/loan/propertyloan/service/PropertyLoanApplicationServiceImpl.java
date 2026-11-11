package com.taxedge.loan.propertyloan.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.loan.propertyloan.dto.PropertyLoanCreateRequest;
import com.taxedge.loan.propertyloan.dto.PropertyLoanResponse;
import com.taxedge.loan.propertyloan.dto.PropertyLoanUpdateRequest;
import com.taxedge.loan.propertyloan.entity.PropertyLoanApplication;
import com.taxedge.loan.propertyloan.helper.PropertyLoanHelper;
import com.taxedge.loan.propertyloan.mapper.PropertyLoanMapper;
import com.taxedge.loan.propertyloan.repository.PropertyLoanApplicationRepository;
import com.taxedge.loan.propertyloan.repository.PropertyLoanDocumentRepository;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropertyLoanApplicationServiceImpl implements PropertyLoanApplicationService {

    private final PropertyLoanApplicationRepository applicationRepository;
    private final PropertyLoanDocumentRepository documentRepository;
    private final CustomerRepository customerRepository;
    private final PropertyLoanMapper mapper;

    @Override
    @Transactional
    public PropertyLoanResponse createApplication(PropertyLoanCreateRequest request) {
        String customerId = currentCustomerId();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated customer not found: " + customerId));

        PropertyLoanApplication entity = mapper.toEntity(request);
        int year = java.time.Year.now().getValue();
        long seq = applicationRepository.getNextSequenceValue();
        entity.setId(PropertyLoanHelper.formatLoanApplicationId(year, seq));
        entity.setCustomer(customer);
        entity.setStatus(LoanApplicationStatus.DRAFT);

        PropertyLoanApplication saved = applicationRepository.save(entity);
        log.info("Created property loan application {} for customer {}", saved.getId(), customerId);

        return mapper.toResponse(saved);
    }

    @Override
    public PropertyLoanResponse getApplication(String id) {
        return mapper.toResponse(findForCurrentCustomer(id));
    }

    @Override
    @Transactional
    public PropertyLoanResponse updateApplication(String id, PropertyLoanUpdateRequest request) {
        PropertyLoanApplication entity = findForCurrentCustomer(id);

        if (entity.getStatus() == LoanApplicationStatus.SUBMITTED) {
            throw new IllegalStateException("Submitted property loan applications cannot be edited");
        }

        mapper.updateFromRequest(request, entity);

        log.info("Updated property loan application {}", id);
        return mapper.toResponse(entity);
    }

    @Override
    @Transactional
    public void deleteApplication(String id) {
        PropertyLoanApplication entity = findForCurrentCustomer(id);
        documentRepository.deleteByLoanApplication_Id(entity.getId());
        applicationRepository.delete(entity);
        log.info("Deleted property loan application {} and associated documents", id);
    }

    @Override
    @Transactional
    public PropertyLoanResponse submitApplication(String id) {
        PropertyLoanApplication application = findForCurrentCustomer(id);

        if (application.getStatus() == LoanApplicationStatus.SUBMITTED) {
            log.info("Application {} is already submitted", id);
            return mapper.toResponse(application);
        }

        application.setStatus(LoanApplicationStatus.SUBMITTED);
        log.info("Property loan application {} submitted successfully", id);

        return mapper.toResponse(application);
    }

    @Override
    public List<PropertyLoanResponse> getMyApplications() {
        return applicationRepository.findByCustomer_CustIdOrderByCreatedAtDesc(currentCustomerId())
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    private PropertyLoanApplication findForCurrentCustomer(String id) {
        if (!StringUtils.hasText(id)) {
            throw new IllegalArgumentException("Loan application ID is required");
        }
        return applicationRepository.findByIdAndCustomer_CustId(id.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Property loan application not found: " + id));
    }

    private String currentCustomerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof JwtPrincipal principal)
                || !StringUtils.hasText(principal.custId())
                || !authentication.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_CUSTOMER".equals(authority.getAuthority()))) {
            throw new AccessDeniedException("An authenticated customer is required");
        }
        return principal.custId();
    }
}
