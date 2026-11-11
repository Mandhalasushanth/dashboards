
package com.taxedge.loan.homeloan.service;

import java.util.List;

import com.taxedge.loan.homeloan.dto.HomeLoanRequirementApplicationDto;

public interface HomeLoanRequirementApplicationService {


    HomeLoanRequirementApplicationDto createApplication(
            HomeLoanRequirementApplicationDto dto);


    HomeLoanRequirementApplicationDto getApplication(
            String homeLoanId);

    List<HomeLoanRequirementApplicationDto> getAllApplications();

    HomeLoanRequirementApplicationDto updateApplication(
            String homeLoanId,
            HomeLoanRequirementApplicationDto dto);

    void deleteApplication(String homeLoanId);
}
