package com.taxedge.loan.vehicleloan.service;

import java.util.List;

import com.taxedge.loan.vehicleloan.dto.VehicleLoanCreateRequest;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanDetailsDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanKycResponseDto;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanResponse;
import com.taxedge.loan.vehicleloan.dto.VehicleLoanUpdateRequest;

public interface VehicleLoanApplicationService {

    VehicleLoanResponse createApplication(VehicleLoanCreateRequest request);

    VehicleLoanResponse createApplication(VehicleLoanDetailsDto request);

    VehicleLoanResponse getVehicleLoan(String vehicleLoanId);

    VehicleLoanResponse updateVehicleLoan(String vehicleLoanId, VehicleLoanUpdateRequest request);

    VehicleLoanResponse updateVehicleLoan(String vehicleLoanId, VehicleLoanDetailsDto request);

    VehicleLoanResponse submitApplication(String vehicleLoanId);

    List<VehicleLoanResponse> getMyApplications();

    void deleteApplication(String vehicleLoanId);

    VehicleLoanKycResponseDto getKycDetails(String customerId);
}
