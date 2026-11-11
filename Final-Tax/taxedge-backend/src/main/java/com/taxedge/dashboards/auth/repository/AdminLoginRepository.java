package com.taxedge.dashboards.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.dashboards.auth.entity.AdminLogin;

/**
 * Spring Data JPA Repository for AdminLogin entity.
 */
@Repository
public interface AdminLoginRepository extends JpaRepository<AdminLogin, Long> {

    Optional<AdminLogin> findByEmail(String email);

    boolean existsByEmail(String email);
}