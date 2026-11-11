package com.taxedge.loan.personalloan.service;

import java.util.List;

import com.taxedge.loan.personalloan.dto.PersonalLoanApplicationDto;

public interface PersonalLoanApplicationService {

    PersonalLoanApplicationDto saveApplication(PersonalLoanApplicationDto dto);

    PersonalLoanApplicationDto updateApplication(String id, PersonalLoanApplicationDto dto);

    PersonalLoanApplicationDto getApplication(String id);

    List<PersonalLoanApplicationDto> getMyApplications();

    void deleteApplication(String id);
}
