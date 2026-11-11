package com.taxedge.dashboards.camanagers.bucket.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.dashboards.camanagers.bucket.dto.AddToBucketRequestDto;
import com.taxedge.dashboards.camanagers.bucket.dto.BucketSummaryDto;
import com.taxedge.dashboards.camanagers.bucket.dto.UpdateBucketRequestDto;
import com.taxedge.dashboards.camanagers.bucket.entity.CaManagerBucketItem;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketStage;
import com.taxedge.dashboards.camanagers.bucket.helper.CaManagerBucketHelper;
import com.taxedge.dashboards.camanagers.bucket.repository.CaManagerBucketRepository;
import com.taxedge.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CaManagerBucketServiceImpl implements CaManagerBucketService {

    private final CaManagerBucketRepository bucketRepository;
    private final CaManagerBucketHelper bucketHelper;

    @Override
    @Transactional
    public String addToBucket(AddToBucketRequestDto request) {
        Long managerId = bucketHelper.resolveCurrentManagerId(request.getManagerId());
        log.info("Adding application [{}] ({}) to bucket", request.getApplicationId(), request.getApplicationCategory());

        CaManagerBucketItem item = CaManagerBucketItem.builder()
                .manager(bucketHelper.findManager(managerId))
                .applicationId(request.getApplicationId().trim())
                .applicationCategory(request.getApplicationCategory())
                .applicationType(request.getApplicationType())
                .bucketStage(Optional.ofNullable(request.getStage()).orElse(BucketStage.NEW))
                .build();

        bucketHelper.enrichCustomerRelation(item, request.getCustId());

        CaManagerBucketItem saved = bucketRepository.save(item);
        log.info("Application [{}] added to bucket with ID [{}]", saved.getApplicationId(), saved.getId());
        return "Application [" + saved.getApplicationId() + "] successfully added to bucket with ID [" + saved.getId() + "].";
    }

    @Override
    @Transactional
    public String updateBucketItem(Long id, UpdateBucketRequestDto request) {
        CaManagerBucketItem item = bucketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket item not found with ID: " + id));

        bucketHelper.applyUpdates(item, request);
        bucketRepository.save(item);
        return "Bucket item [" + id + "] successfully updated.";
    }

    @Override
    @Transactional
    public String updateBucketItemByApplicationId(String applicationId, UpdateBucketRequestDto request) {
        CaManagerBucketItem item = bucketRepository.findFirstByApplicationId(applicationId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Bucket item not found for application ID: " + applicationId));

        bucketHelper.applyUpdates(item, request);
        bucketRepository.save(item);
        return "Bucket item for application [" + applicationId + "] successfully updated.";
    }

    @Override
    @Transactional
    public String deleteBucketItem(Long id) {
        CaManagerBucketItem item = bucketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket item not found with ID: " + id));

        bucketRepository.delete(item);
        log.info("Deleted bucket item [{}]", id);
        return "Bucket item [" + id + "] successfully removed from bucket.";
    }

    @Override
    @Transactional(readOnly = true)
    public List<CaManagerBucketItem> getBucketDetailsByManagerId(Long managerId) {
        Long resolvedManagerId = bucketHelper.resolveCurrentManagerId(managerId);
        if (resolvedManagerId == null) {
            return bucketRepository.findAll();
        }
        return bucketRepository.findByManagerIdOrderByUpdatedAtDesc(resolvedManagerId);
    }

    @Override
    @Transactional(readOnly = true)
    public BucketSummaryDto getBucketSummary() {
        Long managerId = bucketHelper.resolveCurrentManagerId(null);

        if (managerId != null) {
            return BucketSummaryDto.builder()
                    .totalCount(bucketRepository.countByManagerId(managerId))
                    .newCount(bucketRepository.countByManagerIdAndBucketStage(managerId, BucketStage.NEW))
                    .inReviewCount(bucketRepository.countByManagerIdAndBucketStage(managerId, BucketStage.IN_REVIEW))
                    .needsDocumentsCount(bucketRepository.countByManagerIdAndBucketStage(managerId, BucketStage.NEEDS_DOCUMENTS))
                    .readyForAgentCount(bucketRepository.countByManagerIdAndBucketStage(managerId, BucketStage.READY_FOR_AGENT))
                    .onHoldCount(bucketRepository.countByManagerIdAndBucketStage(managerId, BucketStage.ON_HOLD))
                    .completedCount(bucketRepository.countByManagerIdAndBucketStage(managerId, BucketStage.COMPLETED))
                    .build();
        }

        return BucketSummaryDto.builder()
                .totalCount(bucketRepository.count())
                .newCount(bucketRepository.countByBucketStage(BucketStage.NEW))
                .inReviewCount(bucketRepository.countByBucketStage(BucketStage.IN_REVIEW))
                .needsDocumentsCount(bucketRepository.countByBucketStage(BucketStage.NEEDS_DOCUMENTS))
                .readyForAgentCount(bucketRepository.countByBucketStage(BucketStage.READY_FOR_AGENT))
                .onHoldCount(bucketRepository.countByBucketStage(BucketStage.ON_HOLD))
                .completedCount(bucketRepository.countByBucketStage(BucketStage.COMPLETED))
                .build();
    }
}
