package com.taxedge.gst.registration.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxedge.gst.registration.entity.Documents;

public interface DocumentsRepository extends JpaRepository<Documents, String> {

	Optional<Documents> findByBusiness_GstId(String gstId);
}
