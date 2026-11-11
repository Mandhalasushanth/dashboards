package com.taxedge.security.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
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
public class VerifyGstinRequest {

    @NotBlank(message = "GSTIN is required")
    @JsonProperty("gstin")
    @JsonAlias({"gstNumber", "gst_number", "gstinNumber"})
    private String gstin;
}