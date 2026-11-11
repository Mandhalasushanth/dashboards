package com.taxedge.loan.vehicleloan.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.loan.vehicleloan.entity.VehicleLoanApplication;
import com.taxedge.loan.vehicleloan.enums.VehicleLoanApplicationStatus;

@Repository
public interface VehicleLoanApplicationRepository
        extends JpaRepository<VehicleLoanApplication, String> {

    Optional<VehicleLoanApplication>
    findByVehicleLoanIdAndCustomer_CustId(
            String vehicleLoanId,
            String custId);

    List<VehicleLoanApplication>
    findByCustomer_CustIdOrderByCreatedAtDesc(
            String custId);

    boolean existsByVehicleLoanIdAndCustomer_CustId(
            String vehicleLoanId,
            String custId);

    Optional<VehicleLoanApplication>
    findFirstByCustomer_CustIdAndApplicationStatusOrderByCreatedAtDesc(
            String custId,
            VehicleLoanApplicationStatus applicationStatus);

    @Query(value = "SELECT nextval('vehicle_loan_seq')", nativeQuery = true)
    Long getNextSequenceValue();
}
