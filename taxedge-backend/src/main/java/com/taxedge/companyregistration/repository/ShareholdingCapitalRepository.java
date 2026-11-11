package com.taxedge.companyregistration.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.companyregistration.entity.ShareholdingCapital;

public interface ShareholdingCapitalRepository extends JpaRepository<ShareholdingCapital, String> {

	Optional<ShareholdingCapital> findByCompanyDetails_CompanyRegistrationId(String companyRegistrationId);

	/** The capital of several registrations in one query, for the dashboards. */
	List<ShareholdingCapital> findByCompanyDetails_CompanyRegistrationIdIn(Collection<String> companyRegistrationIds);
}
