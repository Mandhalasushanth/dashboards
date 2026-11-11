package com.taxedge.itr.reviseditr.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.itr.reviseditr.entity.RevisedItrDetails;

@Repository
public interface RevisedItrDetailsRepository extends JpaRepository<RevisedItrDetails, String> {

	Optional<RevisedItrDetails> findByRevisedItrRevisedItrId(String revisedItrId);
}
