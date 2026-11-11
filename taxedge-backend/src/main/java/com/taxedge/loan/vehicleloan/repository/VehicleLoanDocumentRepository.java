package com.taxedge.loan.vehicleloan.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.loan.vehicleloan.entity.VehicleLoanDocument;

@Repository
public interface VehicleLoanDocumentRepository
        extends JpaRepository<VehicleLoanDocument, String> {

    Optional<VehicleLoanDocument>
    findByVehicleLoanApplication_VehicleLoanId(
            String vehicleLoanId
    );
}
