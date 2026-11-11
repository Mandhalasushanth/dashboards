package com.taxedge.security.otp.repository;

import com.taxedge.security.otp.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Otp findTopByMobileNumberOrderByIdDesc(String mobileNumber);
}
