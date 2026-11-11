package com.taxedge.itr.filing.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taxedge.itr.filing.entity.SalaryIncome;

@Repository
public interface SalaryIncomeRepository extends JpaRepository<SalaryIncome, String> {
}
