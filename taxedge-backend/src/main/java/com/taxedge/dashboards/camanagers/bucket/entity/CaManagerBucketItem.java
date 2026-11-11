package com.taxedge.dashboards.camanagers.bucket.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.entity.ManagerLogin;
import com.taxedge.dashboards.camanagers.bucket.enums.ApplicationCategory;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketPriority;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketStage;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "ca_manager_bucket_items",
        indexes = {
                @Index(name = "idx_bucket_mgr_stage", columnList = "manager_id, bucket_stage"),
                @Index(name = "idx_bucket_mgr_prio", columnList = "manager_id, priority")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaManagerBucketItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "refreshTokenHash"})
    private ManagerLogin manager;

    @Column(name = "application_id", nullable = false, length = 100)
    private String applicationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_category", nullable = false, length = 30)
    private ApplicationCategory applicationCategory;

    @Column(name = "application_type", length = 100)
    private String applicationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cust_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "pushToken"})
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "refreshTokenHash"})
    private AgentLogin assignedAgent;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "bucket_stage", nullable = false, length = 30)
    private BucketStage bucketStage = BucketStage.NEW;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private BucketPriority priority;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

