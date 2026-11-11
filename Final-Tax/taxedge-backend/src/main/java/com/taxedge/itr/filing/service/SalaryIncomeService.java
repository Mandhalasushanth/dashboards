package com.taxedge.itr.filing.service;

import com.taxedge.itr.filing.dto.SalaryIncomeDto;

public interface SalaryIncomeService {

	String registerSalaryIncome(String itrId, SalaryIncomeDto salaryIncomeDto);

	SalaryIncomeDto getSalaryIncome(String incomeId);

	String updateSalaryIncome(String incomeId, SalaryIncomeDto salaryIncomeDto);

	String deleteSalaryIncome(String incomeId);
}
