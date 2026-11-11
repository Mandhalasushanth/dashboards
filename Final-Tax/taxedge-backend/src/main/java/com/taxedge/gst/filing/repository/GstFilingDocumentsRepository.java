package com.taxedge.gst.filing.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.gst.filing.entity.GstFilingDocuments;

public interface GstFilingDocumentsRepository
        extends JpaRepository<GstFilingDocuments, String> {

    Optional<GstFilingDocuments> findByGstFiling_GstfilingId(
            String gstfilingId);

    boolean existsByGstFiling_GstfilingId(
            String gstfilingId);
}
