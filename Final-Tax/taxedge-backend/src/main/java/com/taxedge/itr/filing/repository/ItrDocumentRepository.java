package com.taxedge.itr.filing.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.itr.filing.entity.ItrDocument;

@Repository
public interface ItrDocumentRepository extends JpaRepository<ItrDocument, String> {

	Optional<ItrDocument> findByItrFiling_ItrId(String itrId);

	boolean existsByItrFiling_ItrId(String itrId);
}
