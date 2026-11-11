package com.taxedge.loan.vehicleloan.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanCreateRequest;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanDetailsDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanKycResponseDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanResponse;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanUpdateRequest;
import com.taxedge.loan.vehicleloan.entity.VehicleLoanApplication;
import com.taxedge.loan.vehicleloan.enums.VehicleLoanApplicationStatus;
import com.taxedge.loan.vehicleloan.mapper.VehicleLoanApplicationMapper;
import com.taxedge.loan.vehicleloan.repository.VehicleLoanApplicationRepository;
import com.taxedge.security.jwt.JwtPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleLoanApplicationServiceImpl implements VehicleLoanApplicationService {

    private final VehicleLoanApplicationRepository applicationRepository;
    private final CustomerRepository customerRepository;
    private final VehicleLoanApplicationMapper applicationMapper;
    private final VehicleLoanIdGeneratorService vehicleLoanIdGeneratorService;

    @Override
    public VehicleLoanResponse createApplication(VehicleLoanCreateRequest request) {
        Customer customer = getCurrentCustomer();
        VehicleLoanApplication application = applicationMapper.toEntity(request);
        application.setVehicleLoanId(vehicleLoanIdGeneratorService.generateVehicleLoanId());
        application.setCustomer(customer);
        application.setApplicationStatus(VehicleLoanApplicationStatus.DRAFT);

        return applicationMapper.toResponse(applicationRepository.save(application));
    }

    @Override
    public VehicleLoanResponse createApplication(VehicleLoanDetailsDto request) {
        Customer customer = getCurrentCustomer();
        VehicleLoanApplication application = applicationMapper.toEntityFromDetailsDto(request);
        application.setVehicleLoanId(vehicleLoanIdGeneratorService.generateVehicleLoanId());
        application.setCustomer(customer);
        application.setApplicationStatus(VehicleLoanApplicationStatus.DRAFT);

        return applicationMapper.toResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleLoanResponse getVehicleLoan(String vehicleLoanId) {
        return applicationMapper.toResponse(getOwnedApplication(vehicleLoanId));
    }

    @Override
    public VehicleLoanResponse updateVehicleLoan(String vehicleLoanId, VehicleLoanUpdateRequest request) {
        VehicleLoanApplication application = getOwnedApplication(vehicleLoanId);
        validateApplicationEditable(application);

        applicationMapper.updateEntityFromRequest(request, application);
        application.setUpdatedAt(LocalDateTime.now());
        return applicationMapper.toResponse(applicationRepository.save(application));
    }

    @Override
    public VehicleLoanResponse updateVehicleLoan(String vehicleLoanId, VehicleLoanDetailsDto request) {
        VehicleLoanApplication application = getOwnedApplication(vehicleLoanId);
        validateApplicationEditable(application);

        applicationMapper.updateEntityFromDetailsDto(request, application);
        application.setUpdatedAt(LocalDateTime.now());
        return applicationMapper.toResponse(applicationRepository.save(application));
    }

    @Override
    public VehicleLoanResponse submitApplication(String vehicleLoanId) {
        VehicleLoanApplication application = getOwnedApplication(vehicleLoanId);
        validateApplicationEditable(application);

        application.setApplicationStatus(VehicleLoanApplicationStatus.SUBMITTED);
        application.setUpdatedAt(LocalDateTime.now());
        return applicationMapper.toResponse(applicationRepository.save(application));
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleLoanResponse> getMyApplications() {
        return applicationRepository.findByCustomer_CustIdOrderByCreatedAtDesc(currentCustomerId())
                .stream()
                .map(applicationMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteApplication(String vehicleLoanId) {
        VehicleLoanApplication application = getOwnedApplication(vehicleLoanId);
        validateApplicationEditable(application);
        applicationRepository.delete(application);
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleLoanKycResponseDto getKycDetails(String customerId) {
        Customer customer = getCurrentCustomer();
        return VehicleLoanKycResponseDto.builder()
                .customerId(customer.getCustId())
                .fullLegalName(customer.getName())
                .mobileNumber(customer.getMobileNumber())
                .emailAddress(customer.getEmail())
                .panNumber(customer.getPan())
                .aadhaarNumber(customer.getAadhaar())
                .dateOfBirth(customer.getDob())
                .houseOrBuilding(customer.getAddressLine1())
                .streetOrLocality(customer.getAddressLine2())
                .cityOrDistrict(customer.getCity())
                .pinCode(customer.getPincode())
                .state(customer.getState())
                .build();
    }

    private VehicleLoanApplication getOwnedApplication(String vehicleLoanId) {
        return applicationRepository.findByVehicleLoanIdAndCustomer_CustId(vehicleLoanId, currentCustomerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Vehicle loan application not found: " + vehicleLoanId));
    }

    private Customer getCurrentCustomer() {
        String authCustId = currentCustomerId();
        return customerRepository.findById(authCustId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found: " + authCustId));
    }

    private void validateApplicationEditable(VehicleLoanApplication application) {
        if (application.getApplicationStatus() == VehicleLoanApplicationStatus.SUBMITTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This application has already been submitted and cannot be edited.");
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
}