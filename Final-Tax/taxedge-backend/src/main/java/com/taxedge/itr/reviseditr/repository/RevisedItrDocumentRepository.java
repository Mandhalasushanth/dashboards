package com.taxedge.itr.reviseditr.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.itr.reviseditr.entity.RevisedItrDocument;

@Repository
public interface RevisedItrDocumentRepository extends JpaRepository<RevisedItrDocument, String> {

	List<RevisedItrDocument> findByRevisedItrRevisedItrId(String revisedItrId);
}
