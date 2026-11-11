package com.taxedge.loan.vehicleloan.service;

import java.time.LocalDateTime;
import java.time.Year;

import org.springframework.stereotype.Service;

import com.taxedge.loan.vehicleloan.helper.VehicleLoanHelper;
import com.taxedge.loan.vehicleloan.repository.VehicleLoanApplicationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VehicleLoanIdGeneratorService {

    private final VehicleLoanApplicationRepository repository;

    public String generateVehicleLoanId() {
        int year = Year.now().getValue();
        long sequence = repository.getNextSequenceValue();
        return VehicleLoanHelper.formatLoanApplicationId(year, sequence);
    }
}
