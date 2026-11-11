package com.taxedge.dashboards.agents.gst.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

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
public class AssignAgentRequest {

    @NotBlank(message = "Application ID is required")
    @JsonProperty("applicationId")
    @JsonAlias("id")
    private String applicationId;

    @NotNull(message = "Agent ID is required")
    private Long agentId;

    private String applicationType;

    private String priority;

    private LocalDate dueDate;

    private String notes;
}

