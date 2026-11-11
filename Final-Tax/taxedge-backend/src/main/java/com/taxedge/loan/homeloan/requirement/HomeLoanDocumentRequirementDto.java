
package com.taxedge.loan.homeloan.requirement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeLoanDocumentRequirementDto {

    private String documentType;
    private String documentName;
    private String description;
    private boolean required;
    private boolean uploaded;
}
