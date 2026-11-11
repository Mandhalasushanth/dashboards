package com.taxedge.customer.service;

import java.time.LocalDateTime;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.dto.CustomerDto;
import com.taxedge.customer.dto.LoginRequest;
import com.taxedge.customer.dto.UpdatePasswordDto;
import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.exception.CustomerNotFoundException;
import com.taxedge.customer.exception.DuplicateResourceException;
import com.taxedge.customer.exception.InvalidCredentialsException;
import com.taxedge.customer.helper.CustomerHelper;
import com.taxedge.customer.mapper.CustomerMapper;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.messaging.service.EmailService;
import com.taxedge.notification.service.FcmNotificationService;
import com.taxedge.security.jwt.CustomerJwt;
import com.taxedge.security.jwt.service.JwtService;
import com.taxedge.security.jwt.service.RefreshTokenService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerMapper customerMapper;
    private final FcmNotificationService fcmNotificationService;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;

    @Override
    @Transactional
    public CustomerJwt registerCustomer(CustomerDto customerDto) {

        validateUniqueFields(customerDto);

        Customer customer = customerMapper.toEntity(customerDto);
        customer.setCustId(CustomerHelper.generateCustomerId());
        customer.setPassword(passwordEncoder.encode(customerDto.getPassword()));
        customer.setCreatedAt(LocalDateTime.now());

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Customer registered [{}]", savedCustomer.getCustId());

        String accessToken = jwtService.generateToken(
                savedCustomer.getCustId(),
                savedCustomer.getName(),
                savedCustomer.getMobileNumber()
        );

        log.debug("[TEST-ONLY] Access token for [{}]: {}", savedCustomer.getCustId(), accessToken);
        String refreshToken = refreshTokenService.createRefreshToken(savedCustomer);

        // Nothing is announced until the row is actually committed.
        final String custId = savedCustomer.getCustId();
        final String name = savedCustomer.getName();
        final String email = savedCustomer.getEmail();
        final String pushToken = savedCustomer.getPushToken();

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {

                        if (pushToken != null && !pushToken.isBlank()) {
                            try {
                                fcmNotificationService
                                        .sendRegistrationSuccessNotification(pushToken, name);
                            } catch (Exception ex) {
                                log.warn("Registration push failed for [{}]", custId, ex);
                            }
                        }

                        if (email != null && !email.isBlank()) {
                            emailService.sendWelcomeEmail(email, name, custId);
                        }
                    }
                });

        return new CustomerJwt(
                accessToken,
                refreshToken,
                savedCustomer.getCustId(),
                savedCustomer.getName(),
                savedCustomer.getMobileNumber()
        );
    }

    private void validateUniqueFields(CustomerDto dto) {

        if (isPresent(dto.getMobileNumber()) && customerRepository.existsByMobileNumber(dto.getMobileNumber().trim())) {
            throw new DuplicateResourceException("mobileNumber", "Mobile number already registered");
        }

        if (isPresent(dto.getEmail()) && customerRepository.existsByEmail(dto.getEmail().trim())) {
            throw new DuplicateResourceException("email", "Email already registered");
        }

        if (isPresent(dto.getAadhaar()) && customerRepository.existsByAadhaar(dto.getAadhaar().trim())) {
            throw new DuplicateResourceException("aadhaar", "Aadhaar already registered");
        }

        if (isPresent(dto.getPan()) && customerRepository.existsByPan(dto.getPan().trim())) {
            throw new DuplicateResourceException("pan", "PAN already registered");
        }
    }

    private boolean isPresent(String value) {
        return value != null && !value.isBlank();
    }

    @Override
    @Transactional
    public CustomerJwt loginCustomer(LoginRequest loginRequest) {
        String mobileNumber = loginRequest.getMobileNumber() != null ? loginRequest.getMobileNumber().trim() : "";
        Customer customer = customerRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid mobile number or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), customer.getPassword())) {
            throw new InvalidCredentialsException("Invalid mobile number or password");
        }

        String accessToken = jwtService.generateToken(
                customer.getCustId(),
                customer.getName(),
                customer.getMobileNumber()
        );

        String refreshToken = refreshTokenService.createRefreshToken(customer);

        System.out.println("=================================================");
        System.out.println("🔑 [LOGIN SUCCESS] Access token for user (" + customer.getCustId() + " / " + customer.getMobileNumber() + "):");
        System.out.println(accessToken);
        System.out.println("=================================================");

        return new CustomerJwt(
                accessToken,
                refreshToken,
                customer.getCustId(),
                customer.getName(),
                customer.getMobileNumber()
        );
    }

    @Override
    @Transactional
    public String updatePassword(UpdatePasswordDto updatePasswordDto) {
        String mobileNumber = updatePasswordDto.getMobileNumber() != null
                ? updatePasswordDto.getMobileNumber().trim()
                : "";

        Customer customer = customerRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new InvalidCredentialsException("Customer not found"));

        if (updatePasswordDto.getPassword() == null || updatePasswordDto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        customer.setPassword(passwordEncoder.encode(updatePasswordDto.getPassword()));
        customerRepository.save(customer);

        return "Password updated successfully";
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByMobileNumber(String mobileNumber) {
        return mobileNumber != null && customerRepository.existsByMobileNumber(mobileNumber.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDto getDetails(String custId) {
        Customer customer = (custId != null && !custId.isBlank())
                ? customerRepository.findById(custId.trim()).orElse(null)
                : null;

        if (customer == null && custId != null && !custId.isBlank()) {
            customer = customerRepository.findByMobileNumber(custId.trim()).orElse(null);
        }

        if (customer == null) {
            throw new CustomerNotFoundException("Customer not found with id or mobile: " + custId);
        }

        return customerMapper.toDto(customer);
    }

    @Override
    @Transactional
    public String updateCustomer(CustomerDto dto) {
        Customer customer = (dto.getCustId() != null && !dto.getCustId().isBlank())
                ? customerRepository.findById(dto.getCustId().trim()).orElse(null)
                : null;

        if (customer == null && dto.getMobileNumber() != null && !dto.getMobileNumber().isBlank()) {
            customer = customerRepository.findByMobileNumber(dto.getMobileNumber().trim()).orElse(null);
        }

        if (customer == null) {
            String identifier = (dto.getCustId() != null && !dto.getCustId().isBlank())
                    ? dto.getCustId().trim()
                    : (dto.getMobileNumber() != null ? dto.getMobileNumber().trim() : "unknown");
            throw new CustomerNotFoundException("Customer not found with id or mobile: " + identifier);
        }

        customerMapper.updateCustomerFromDto(dto, customer);

        customerRepository.save(customer);
        return "Updated Successfully";
    }

}
