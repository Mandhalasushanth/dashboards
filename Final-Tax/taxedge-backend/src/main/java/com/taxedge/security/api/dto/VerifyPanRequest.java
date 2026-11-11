package com.taxedge.security.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyPanRequest {

    private String pan;

    @JsonProperty("name_as_per_pan")
    private String nameAsPerPan;

    @JsonProperty("date_of_birth")
    private String dateOfBirth;

    private String consent;

    private String reason;
}