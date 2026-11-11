package com.taxedge.customer.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.entity.Customer;

import jakarta.persistence.LockModeType;

public interface CustomerRepository extends JpaRepository<Customer, String> {
	
	boolean existsByAadhaar(String aadhaar);

    boolean existsByPan(String pan); 

    boolean existsByMobileNumber(String mobileNumber);

    boolean existsByEmail(String email);

    Optional<Customer> findByMobileNumber(String mobileNumber);

    @Query("""
        SELECT c.pushToken FROM Customer c
        WHERE c.pushToken IS NOT NULL AND c.pushToken <> ''
        """)
    List<String> findAllPushTokens();

    @Transactional
    @Modifying
    @Query("UPDATE Customer c SET c.pushToken = null WHERE c.pushToken = :token")
    void clearPushToken(@Param("token") String token);
    
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Customer c WHERE c.custId = :custId")
    Optional<Customer> findByCustIdForUpdate(@Param("custId") String custId);
 
}
