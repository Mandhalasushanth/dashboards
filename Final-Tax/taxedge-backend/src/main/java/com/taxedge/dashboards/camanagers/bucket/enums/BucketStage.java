package com.taxedge.dashboards.camanagers.bucket.enums;

/**
 * Lifecycle stages for applications inside a CA Manager's bucket.
 */
public enum BucketStage {
    NEW,
    IN_REVIEW,
    NEEDS_DOCUMENTS,
    READY_FOR_AGENT,
    ASSIGNED,
    ON_HOLD,
    COMPLETED
}
