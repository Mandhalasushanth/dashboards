package com.taxedge.dashboards.camanagers.bucket.dto;

import java.time.LocalDate;

import com.taxedge.dashboards.camanagers.bucket.enums.BucketPriority;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketStage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBucketRequestDto {

    private BucketStage stage;

    private BucketPriority priority;

    private String notes;

    private LocalDate dueDate;

    private Long agentId;
}
