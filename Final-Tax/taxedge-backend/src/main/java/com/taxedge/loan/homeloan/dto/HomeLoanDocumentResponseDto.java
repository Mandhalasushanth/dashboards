
package com.taxedge.loan.homeloan.dto;

import com.taxedge.loan.homeloan.requirement.HomeLoanDocumentRequirementDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeLoanDocumentResponseDto {

    private String documentId;
    private String homeLoanId;

    private List<HomeLoanDocumentRequirementDto> documents;
}
