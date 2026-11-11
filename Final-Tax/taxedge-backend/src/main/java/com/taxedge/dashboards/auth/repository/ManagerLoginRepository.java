package com.taxedge.dashboards.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.dashboards.auth.entity.ManagerLogin;
import com.taxedge.dashboards.auth.enums.ManagerRole;

/**
 * Spring Data JPA Repository for ManagerLogin entity.
 */
 
public interface ManagerLoginRepository extends JpaRepository<ManagerLogin, Long> {

    Optional<ManagerLogin> findByEmailIgnoreCase(String email);


    List<ManagerLogin> findByRoleOrderByFullNameAsc(ManagerRole role);

    List<ManagerLogin> findAllByOrderByFullNameAsc();
}
