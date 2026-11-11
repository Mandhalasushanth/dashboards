package com.taxedge.dashboards.camanagers.bucket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.taxedge.dashboards.camanagers.bucket.entity.CaManagerBucketItem;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketStage;

@Repository
public interface CaManagerBucketRepository extends JpaRepository<CaManagerBucketItem, Long>, JpaSpecificationExecutor<CaManagerBucketItem> {

    Optional<CaManagerBucketItem> findFirstByApplicationId(String applicationId);

    List<CaManagerBucketItem> findByManagerIdOrderByUpdatedAtDesc(Long managerId);

    List<CaManagerBucketItem> findByManagerId(Long managerId);

    long countByManagerId(Long managerId);

    long countByManagerIdAndBucketStage(Long managerId, BucketStage bucketStage);

    long countByBucketStage(BucketStage bucketStage);
}
