package com.taxedge.companyregistration.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.companyregistration.entity.PromoterDirectorDetails;

@Repository
public interface PromoterDirectorDetailsRepository extends JpaRepository<PromoterDirectorDetails, String> {

	List<PromoterDirectorDetails> findByCompanyDetails_CompanyRegistrationId(String companyRegistrationId);

	/** The directors of several registrations in one query, for the dashboards. */
	List<PromoterDirectorDetails> findByCompanyDetails_CompanyRegistrationIdIn(Collection<String> companyRegistrationIds);
}
