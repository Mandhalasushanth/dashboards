package com.taxedge.companyregistration.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareholdingPatternDto {

    private String shareholdingPatternId;

    @NotBlank(message = "Promoter/Director ID is required")
    private String promoterDirectorId;

    @NotNull(message = "Allocated shares are required")
    @Positive(message = "Allocated shares must be greater than zero")
    private Long allocatedShares;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;
}