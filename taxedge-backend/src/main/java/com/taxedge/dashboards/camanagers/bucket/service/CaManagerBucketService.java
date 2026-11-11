package com.taxedge.dashboards.camanagers.bucket.service;

import java.util.List;

import com.taxedge.dashboards.camanagers.bucket.dto.AddToBucketRequestDto;
import com.taxedge.dashboards.camanagers.bucket.dto.BucketSummaryDto;
import com.taxedge.dashboards.camanagers.bucket.dto.UpdateBucketRequestDto;
import com.taxedge.dashboards.camanagers.bucket.entity.CaManagerBucketItem;

public interface CaManagerBucketService {

    String addToBucket(AddToBucketRequestDto request);

    String updateBucketItem(Long id, UpdateBucketRequestDto request);

    String updateBucketItemByApplicationId(String applicationId, UpdateBucketRequestDto request);

    String deleteBucketItem(Long id);

    List<CaManagerBucketItem> getBucketDetailsByManagerId(Long managerId);

    BucketSummaryDto getBucketSummary();
}
