package com.taxedge.companyregistration.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.companyregistration.entity.RegisteredOfficeDetails;

@Repository
public interface RegisteredOfficeDetailsRepository extends JpaRepository<RegisteredOfficeDetails, String> {

    /** The offices of several registrations in one query, for the dashboards. */
    List<RegisteredOfficeDetails> findByCompanyDetails_CompanyRegistrationIdIn(Collection<String> companyRegistrationIds);
}
