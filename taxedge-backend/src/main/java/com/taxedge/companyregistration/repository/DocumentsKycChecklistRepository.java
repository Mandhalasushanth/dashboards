package com.taxedge.companyregistration.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.companyregistration.entity.DocumentsKycChecklist;

@Repository
public interface DocumentsKycChecklistRepository extends JpaRepository<DocumentsKycChecklist, String> {

	Optional<DocumentsKycChecklist> findByCompanyDetails_CompanyRegistrationId(String companyRegistrationId);

	/** The documents of several registrations in one query, for the dashboards. */
	List<DocumentsKycChecklist> findByCompanyDetails_CompanyRegistrationIdIn(Collection<String> companyRegistrationIds);
}
