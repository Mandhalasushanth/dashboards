package com.taxedge.dashboards.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.dashboards.auth.entity.AgentLogin;
import com.taxedge.dashboards.auth.enums.AgentRole;

/**
 * Spring Data JPA Repository for AgentLogin entity. List queries load each
 * agent's manager in the same query, for the "Reports to" column.
 */
@Repository
public interface AgentLoginRepository extends JpaRepository<AgentLogin, Long> {

    Optional<AgentLogin> findByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "manager")
    List<AgentLogin> findAllByOrderByFullNameAsc();

    @EntityGraph(attributePaths = "manager")
    List<AgentLogin> findByRoleOrderByFullNameAsc(AgentRole role);

    @EntityGraph(attributePaths = "manager")
    List<AgentLogin> findByManagerIdOrderByFullNameAsc(Long managerId);

    boolean existsByManagerId(Long managerId);
}
