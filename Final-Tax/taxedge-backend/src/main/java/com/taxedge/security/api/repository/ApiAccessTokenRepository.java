package com.taxedge.security.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.security.api.entity.ApiAccessToken;

@Repository
public interface ApiAccessTokenRepository extends JpaRepository<ApiAccessToken, Long> {

    Optional<ApiAccessToken> findFirstByOrderByIdAsc();
}