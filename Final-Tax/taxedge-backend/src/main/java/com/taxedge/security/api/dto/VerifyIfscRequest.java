package com.taxedge.security.api.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class VerifyIfscRequest {

    @NotBlank(message = "IFSC code is required")
    @JsonProperty("ifsc")
    @JsonAlias({"ifscCode", "ifsc_code"})
    private String ifsc;
}