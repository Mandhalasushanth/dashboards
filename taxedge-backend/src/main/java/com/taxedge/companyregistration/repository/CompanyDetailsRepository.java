package com.taxedge.companyregistration.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taxedge.companyregistration.entity.CompanyDetails;

@Repository
public interface CompanyDetailsRepository extends JpaRepository<CompanyDetails, String> {

    @Query("SELECT DISTINCT c FROM CompanyDetails c LEFT JOIN FETCH c.customer ORDER BY c.createdAt DESC NULLS LAST")
    List<CompanyDetails> findAllWithCustomer();

    @Query("SELECT DISTINCT c FROM CompanyDetails c LEFT JOIN FETCH c.customer WHERE c.assignedAgent.id = :agentId ORDER BY c.createdAt DESC NULLS LAST")
    List<CompanyDetails> findByAssignedAgentId(@Param("agentId") Long agentId);
}
