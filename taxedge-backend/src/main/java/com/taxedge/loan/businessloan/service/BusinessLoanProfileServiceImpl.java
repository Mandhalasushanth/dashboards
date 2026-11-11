package com.taxedge.loan.businessloan.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.loan.businessloan.dto.BusinessLoanProfileDto;
import com.taxedge.loan.businessloan.entity.BusinessLoanApplication;
import com.taxedge.loan.businessloan.entity.BusinessLoanProfile;
import com.taxedge.loan.businessloan.mapper.BusinessLoanProfileMapper;
import com.taxedge.loan.businessloan.enums.LoanApplicationStatus;
import com.taxedge.loan.businessloan.repository.BusinessLoanApplicationRepository;
import com.taxedge.loan.businessloan.repository.BusinessLoanProfileRepository;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BusinessLoanProfileServiceImpl implements BusinessLoanProfileService {

    private final BusinessLoanProfileRepository repository;
    private final BusinessLoanApplicationRepository applicationRepository;
    private final BusinessLoanProfileMapper mapper;

    @Override
    @Transactional
    public String saveProfile(BusinessLoanProfileDto dto) {

        BusinessLoanApplication application = getDraftApplication(dto.getLoanApplicationId());

        BusinessLoanProfile entity = repository.findByLoanApplication_Id(application.getId())
                .orElseGet(() -> mapper.toEntity(dto));
        if (entity.getId() != null) {
            mapper.replaceDraftFromDto(dto, entity);
        }
        entity.setLoanApplication(application);

        repository.save(entity);
        touch(application);
        log.info("Business profile saved for application {}", application.getId());

        return application.getId();
    }

    @Override
    @Transactional
    public String updateProfile(String loanApplicationId, BusinessLoanProfileDto dto) {

        BusinessLoanApplication application = getDraftApplication(loanApplicationId);
        BusinessLoanProfile entity = findOrThrow(loanApplicationId);

        mapper.updateFromDto(dto, entity);
        touch(application);

        log.info("Business profile updated for application {}", loanApplicationId);
        return loanApplicationId;
    }

    @Override
    public BusinessLoanProfileDto getProfile(String loanApplicationId) {
        getOwnedApplication(loanApplicationId);
        return mapper.toDto(findOrThrow(loanApplicationId));
    }

    private BusinessLoanProfile findOrThrow(String loanApplicationId) {
        return repository.findByLoanApplication_Id(loanApplicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Business profile not found for application: " + loanApplicationId));
    }

    private BusinessLoanApplication getOwnedApplication(String loanApplicationId) {
        if (!StringUtils.hasText(loanApplicationId)) {
            throw new IllegalArgumentException("Loan application ID is required");
        }
        return applicationRepository.findByIdAndCustomer_CustId(loanApplicationId.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Loan application not found: " + loanApplicationId));
    }

    private BusinessLoanApplication getDraftApplication(String loanApplicationId) {
        if (!StringUtils.hasText(loanApplicationId)) {
            throw new IllegalArgumentException("Loan application ID is required");
        }
        BusinessLoanApplication application = applicationRepository.findByIdAndCustomer_CustIdForUpdate(
                        loanApplicationId.trim(), currentCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Loan application not found"));
        if (application.getStatus() != LoanApplicationStatus.DRAFT) {
            throw new IllegalStateException("Business profile can only be changed on a draft");
        }
        return application;
    }

    private void touch(BusinessLoanApplication application) {
        application.setLastActivityAt(java.time.LocalDateTime.now());
        applicationRepository.save(application);
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
