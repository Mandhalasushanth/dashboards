package com.taxedge.loan.vehicleloan.entity;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vehicle_loan_documents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleLoanDocument {

    @Id
    @Column(
            name = "vehicle_loan_document_id",
            nullable = false,
            unique = true,
            length = 50
    )
    private String vehicleLoanDocumentId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "vehicle_loan_id",
            nullable = false,
            unique = true,
            foreignKey = @ForeignKey(name = "fk_vehicle_loan_documents_application")
    )
    private VehicleLoanApplication vehicleLoanApplication;

    @Column(name = "vehicle_quotation")
    private byte[] vehicleQuotation;

   
    @Column(name = "booking_receipt")
    private byte[] bookingReceipt;

    
    @Column(name = "rc_copy")
    private byte[] rcCopy;

    public void setFileContent(String type, byte[] bytes) {
        if (type == null) return;
        switch (type.toUpperCase()) {
            case "VEHICLE_QUOTATION" -> this.vehicleQuotation = bytes;
            case "BOOKING_RECEIPT" -> this.bookingReceipt = bytes;
            case "RC_COPY" -> this.rcCopy = bytes;
        }
    }

    public byte[] getFileContent(String type) {
        if (type == null) return null;
        return switch (type.toUpperCase()) {
            case "VEHICLE_QUOTATION" -> this.vehicleQuotation;
            case "BOOKING_RECEIPT" -> this.bookingReceipt;
            case "RC_COPY" -> this.rcCopy;
            default -> null;
        };
    }
}
