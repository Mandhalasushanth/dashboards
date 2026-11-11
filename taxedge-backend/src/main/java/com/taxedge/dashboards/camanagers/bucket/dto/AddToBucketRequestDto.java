package com.taxedge.dashboards.camanagers.bucket.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.taxedge.dashboards.camanagers.bucket.enums.ApplicationCategory;
import com.taxedge.dashboards.camanagers.bucket.enums.BucketStage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddToBucketRequestDto {

    @NotBlank(message = "Application ID is required")
    @JsonProperty("applicationId")
    @JsonAlias({"id", "appId"})
    private String applicationId;

    @NotNull(message = "Application category is required (GST, ITR, COMPANY)")
    private ApplicationCategory applicationCategory;

    private String applicationType;

    private String custId;

    @Builder.Default
    private BucketStage stage = BucketStage.NEW;

    private Long managerId;
}
