package com.taxedge.loan.personalloan.service;

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
import com.taxedge.loan.personalloan.dto.PersonalLoanApplicationDto;
import com.taxedge.loan.personalloan.entity.PersonalLoanApplication;
import com.taxedge.loan.personalloan.enums.LoanApplicationStatus;
import com.taxedge.loan.personalloan.helper.PersonalLoanHelper;
import com.taxedge.loan.personalloan.mapper.PersonalLoanApplicationMapper;
import com.taxedge.loan.personalloan.repository.PersonalLoanApplicationRepository;
import com.taxedge.loan.personalloan.repository.PersonalLoanDocumentRepository;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonalLoanApplicationServiceImpl implements PersonalLoanApplicationService {

    private final PersonalLoanApplicationRepository repository;
    private final CustomerRepository customerRepository;
    private final PersonalLoanApplicationMapper mapper;
    private final PersonalLoanDocumentRepository documentRepository;

    @Override
    @Transactional
    public PersonalLoanApplicationDto saveApplication(PersonalLoanApplicationDto dto) {
        String customerId = currentCustomerId();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated customer not found: " + customerId));

        PersonalLoanApplication entity = mapper.toEntity(dto);
        int year = java.time.Year.now().getValue();
        long seq = repository.getNextSequenceValue();
        entity.setId(PersonalLoanHelper.formatLoanApplicationId(year, seq));
        entity.setCustomer(customer);
        entity.setStatus(LoanApplicationStatus.DRAFT);

        PersonalLoanApplication saved = repository.save(entity);
        log.info("Personal loan application created: {}", saved.getId());

        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public PersonalLoanApplicationDto updateApplication(String id, PersonalLoanApplicationDto dto) {
        PersonalLoanApplication entity = findOrThrow(id);
        assertApplicationEditable(entity);

        LoanApplicationStatus currentStatus = entity.getStatus();
        mapper.updateFromDto(dto, entity);
        entity.setStatus(currentStatus);

        log.info("Personal loan application updated: {}", id);
        return mapper.toDto(entity);
    }

    @Override
    public PersonalLoanApplicationDto getApplication(String id) {
        return mapper.toDto(findOrThrow(id));
    }

    @Override
    public List<PersonalLoanApplicationDto> getMyApplications() {
        return repository.findByCustomer_CustIdOrderByCreatedAtDesc(currentCustomerId())
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteApplication(String id) {
        PersonalLoanApplication entity = findOrThrow(id);
        if (entity.getStatus() == LoanApplicationStatus.SUBMITTED || entity.getStatus() == LoanApplicationStatus.APPROVED) {
            throw new IllegalStateException("Submitted or approved personal loan applications cannot be deleted");
        }
        documentRepository.deleteByLoanApplication_Id(entity.getId());
        repository.delete(entity);
        log.info("Deleted personal loan application {} and associated documents", id);
    }

    private PersonalLoanApplication findOrThrow(String id) {
        if (!StringUtils.hasText(id)) {
            throw new IllegalArgumentException("Personal loan application ID is required");
        }
        return repository.findByIdAndCustomer_CustId(id.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Personal loan application not found: " + id));
    }

    private void assertApplicationEditable(PersonalLoanApplication entity) {
        if (entity.getStatus() == LoanApplicationStatus.SUBMITTED) {
            throw new IllegalStateException("Submitted personal loan applications cannot be modified");
        }
        if (entity.getStatus() == LoanApplicationStatus.APPROVED || entity.getStatus() == LoanApplicationStatus.REJECTED) {
            throw new IllegalStateException("Completed personal loan applications cannot be edited");
        }
    }

    private String currentCustomerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof JwtPrincipal principal)
                || !StringUtils.hasText(principal.custId())
                || !authentication.getAuthorities().stream().anyMatch(a -> "ROLE_CUSTOMER".equals(a.getAuthority()))) {
            throw new AccessDeniedException("An authenticated customer is required");
        }
        return principal.custId();
    }
}