package com.taxedge.gst.amendment.entity;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.gst.registration.enums.NatureOfPremises;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "principal_place_amendments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrincipalPlaceAmendmentEntity {

    @Id
    @Column(name = "id", length = 30, nullable = false, unique = true)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    private AgentLogin assignedAgent;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "new_business_address", nullable = false)
    private String newBusinessAddress;

    @Column(name = "new_city", nullable = false)
    private String newCity;

    @Column(name = "new_district", nullable = false)
    private String newDistrict;

    @Column(name = "new_state", nullable = false)
    private String newState;

    @Column(name = "new_pin_code", nullable = false)
    private String newPinCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "nature_of_premises", nullable = false)
    private NatureOfPremises natureOfPremises;

    @Column(name = "image_data")
    private byte[] imageData;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private com.taxedge.gst.registration.enums.RegisterationStatus status = com.taxedge.gst.registration.enums.RegisterationStatus.DRAFT;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
