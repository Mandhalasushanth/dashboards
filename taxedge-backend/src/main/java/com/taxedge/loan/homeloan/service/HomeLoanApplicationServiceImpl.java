package com.taxedge.loan.homeloan.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.loan.homeloan.dto.HomeLoanApplicationKycDto;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HomeLoanApplicationServiceImpl implements HomeLoanApplicationService {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public HomeLoanApplicationKycDto getCustomerKycDetails(String customerId) {
        String effectiveCustId = resolveCustomerId(customerId);

        Customer customer = customerRepository.findById(effectiveCustId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + effectiveCustId));

        String houseFlat = customer.getAddressLine1();
        String streetLocality = customer.getAddressLine2();

        // Fallback to general address field if specific address lines are absent
        if (!StringUtils.hasText(houseFlat) && StringUtils.hasText(customer.getAddress())) {
            houseFlat = customer.getAddress();
        }

        return HomeLoanApplicationKycDto.builder()
                .customerId(customer.getCustId())
                .fullLegalName(customer.getName())
                .mobileNumber(customer.getMobileNumber())
                .emailAddress(customer.getEmail())
                .panNumber(customer.getPan())
                .aadhaarNumber(customer.getAadhaar())
                .dateOfBirth(customer.getDob())
                .houseFlatBuilding(houseFlat)
                .streetLocalityLandmark(streetLocality)
                .city(customer.getCity())
                .pinCode(customer.getPincode())
                .state(customer.getState())
                .build();
    }

    private String resolveCustomerId(String providedId) {
        if (StringUtils.hasText(providedId) && !"me".equalsIgnoreCase(providedId.trim())) {
            return providedId.trim();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof JwtPrincipal principal) {
            if (StringUtils.hasText(principal.custId())) {
                return principal.custId();
            }
        }
        throw new IllegalArgumentException("Customer ID is required");
    }
}
