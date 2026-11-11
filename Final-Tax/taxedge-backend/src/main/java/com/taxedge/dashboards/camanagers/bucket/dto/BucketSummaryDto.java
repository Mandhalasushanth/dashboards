package com.taxedge.dashboards.camanagers.bucket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BucketSummaryDto {

    private long totalCount;
    private long newCount;
    private long inReviewCount;
    private long needsDocumentsCount;
    private long readyForAgentCount;
    private long onHoldCount;
    private long completedCount;
}

