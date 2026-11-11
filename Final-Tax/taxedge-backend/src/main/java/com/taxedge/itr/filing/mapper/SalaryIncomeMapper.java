package com.taxedge.itr.filing.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.taxedge.itr.filing.dto.SalaryIncomeDto;
import com.taxedge.itr.filing.entity.SalaryIncome;

@Mapper(componentModel = "spring")
public interface SalaryIncomeMapper {

	@Mapping(target = "incomeId", ignore = true)
	@Mapping(target = "itrFiling", ignore = true)
	SalaryIncome toEntity(SalaryIncomeDto dto);

	@Mapping(target = "incomeId", ignore = true)
	@Mapping(target = "itrFiling", ignore = true)
	void updateEntity(SalaryIncomeDto dto, @MappingTarget SalaryIncome salaryIncome);

	SalaryIncomeDto toDto(SalaryIncome salaryIncome);
}
