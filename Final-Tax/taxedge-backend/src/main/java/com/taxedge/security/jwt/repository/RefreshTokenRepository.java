package com.taxedge.security.jwt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxedge.customer.entity.Customer;
import com.taxedge.security.jwt.entity.RefreshToken;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    
    @Query("SELECT rt FROM RefreshToken rt JOIN FETCH rt.customer WHERE rt.tokenHash = :hash")
    Optional<RefreshToken> findByTokenHash(@Param("hash") String tokenHash);

    Optional<RefreshToken> findFirstByCustomerAndRevokedFalseOrderByCreatedAtDesc(Customer customer);

    List<RefreshToken> findAllByCustomerAndRevokedFalseAndIdNot(Customer customer, Long excludedId);


    List<RefreshToken> findAllByCustomerAndRevokedFalse(Customer customer);
}
