package com.taxedge.itr.filing.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.itr.filing.dto.SalaryIncomeDto;
import com.taxedge.itr.filing.entity.ItrFiling;
import com.taxedge.itr.filing.entity.SalaryIncome;
import com.taxedge.itr.filing.mapper.SalaryIncomeMapper;
import com.taxedge.itr.filing.repository.ItrFilingRepository;
import com.taxedge.itr.filing.repository.SalaryIncomeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SalaryIncomeServiceImpl implements SalaryIncomeService {

	private final SalaryIncomeRepository salaryIncomeRepository;

	private final ItrFilingRepository itrFilingRepository;

	private final SalaryIncomeMapper salaryIncomeMapper;

	@Override
	public String registerSalaryIncome(String itrId, SalaryIncomeDto salaryIncomeDto) {

		ItrFiling itrFiling = itrFilingRepository.findById(itrId)
				.orElseThrow(() -> new ResourceNotFoundException("ITR Filing not found with itrId: " + itrId));

		validateIncome(salaryIncomeDto);

		SalaryIncome salaryIncome = SalaryIncome.builder()
				.incomeId("FIL" + UUID.randomUUID().toString().replace("-", ""))
				.incomeSource(salaryIncomeDto.getIncomeSource())
				.employerLegalName(salaryIncomeDto.getEmployerLegalName()).grossSalary(salaryIncomeDto.getGrossSalary())
				.exemptAllowances(salaryIncomeDto.getExemptAllowances())
				.tdsDeductedByEmployer(salaryIncomeDto.getTdsDeductedByEmployer())
				.propertyClassification(salaryIncomeDto.getPropertyClassification())
				.homeLoanInterestPaid(salaryIncomeDto.getHomeLoanInterestPaid())
				.annualRentReceived(salaryIncomeDto.getAnnualRentReceived())
				.municipalTaxesPaid(salaryIncomeDto.getMunicipalTaxesPaid())
				.howDoYouReportThisBusiness(salaryIncomeDto.getHowDoYouReportThisBusiness())
				.grossTurnover(salaryIncomeDto.getGrossTurnover())
				.declaredNetProfit(salaryIncomeDto.getDeclaredNetProfit()).assetType(salaryIncomeDto.getAssetType())
				.shortTermGains(salaryIncomeDto.getShortTermGains()).longTermGains(salaryIncomeDto.getLongTermGains())
				.savingsInterest(salaryIncomeDto.getSavingsInterest())
				.fdTermInterest(salaryIncomeDto.getFdTermInterest()).dividendIncome(salaryIncomeDto.getDividendIncome())
				.otherMiscellaneous(salaryIncomeDto.getOtherMiscellaneous()).itrFiling(itrFiling).build();

		salaryIncomeRepository.save(salaryIncome);

		return "Income details registered successfully. Income ID: " + salaryIncome.getIncomeId();
	}

	@Override
	public SalaryIncomeDto getSalaryIncome(String incomeId) {

		SalaryIncome salaryIncome = salaryIncomeRepository.findById(incomeId)
				.orElseThrow(() -> new ResourceNotFoundException("Salary income not found with incomeId: " + incomeId));

		return salaryIncomeMapper.toDto(salaryIncome);
	}

	@Override
	public String updateSalaryIncome(String incomeId, SalaryIncomeDto salaryIncomeDto) {

		SalaryIncome salaryIncome = salaryIncomeRepository.findById(incomeId)
				.orElseThrow(() -> new ResourceNotFoundException("Salary income not found with incomeId: " + incomeId));

		validateIncome(salaryIncomeDto);

		salaryIncomeMapper.updateEntity(salaryIncomeDto, salaryIncome);

		salaryIncomeRepository.save(salaryIncome);

		return "Income details updated successfully. Income ID: " + salaryIncome.getIncomeId();
	}

	@Override
	public String deleteSalaryIncome(String incomeId) {

		SalaryIncome salaryIncome = salaryIncomeRepository.findById(incomeId)
				.orElseThrow(() -> new ResourceNotFoundException("Salary income not found with incomeId: " + incomeId));

		salaryIncomeRepository.delete(salaryIncome);

		return "Income details deleted successfully";
	}

	private void validateIncome(SalaryIncomeDto dto) {

		if (dto.getIncomeSource() == null || dto.getIncomeSource().trim().isEmpty()) {

			throw new IllegalArgumentException("Income source is required");
		}

		if (dto.getIncomeSource().equalsIgnoreCase("Salary / Pension")) {

			if (dto.getEmployerLegalName() == null || dto.getEmployerLegalName().trim().isEmpty()
					|| dto.getGrossSalary() == null || dto.getGrossSalary().trim().isEmpty()
					|| dto.getExemptAllowances() == null || dto.getExemptAllowances().trim().isEmpty()
					|| dto.getTdsDeductedByEmployer() == null || dto.getTdsDeductedByEmployer().trim().isEmpty()) {

				throw new IllegalArgumentException(
						"Employer legal name, gross salary, exempt allowances and TDS deducted by employer are required");
			}
		}

		else if (dto.getIncomeSource().equalsIgnoreCase("House Property")) {

			if (dto.getPropertyClassification() == null) {

				throw new IllegalArgumentException("Property classification is required");
			}

			if (dto.getPropertyClassification().name().equals("SELF_OCCUPIED")) {

				if (dto.getHomeLoanInterestPaid() == null || dto.getHomeLoanInterestPaid().trim().isEmpty()) {

					throw new IllegalArgumentException("Home loan interest paid is required");
				}
			}

			else if (dto.getPropertyClassification().name().equals("LET_OUT_RENTED")) {

				if (dto.getAnnualRentReceived() == null || dto.getAnnualRentReceived().trim().isEmpty()
						|| dto.getMunicipalTaxesPaid() == null || dto.getMunicipalTaxesPaid().trim().isEmpty()
						|| dto.getHomeLoanInterestPaid() == null || dto.getHomeLoanInterestPaid().trim().isEmpty()) {

					throw new IllegalArgumentException(
							"Annual rent received, municipal taxes paid and home loan interest paid are required");
				}
			}
		}

		else if (dto.getIncomeSource().equalsIgnoreCase("Business / Profession")) {

			if (dto.getHowDoYouReportThisBusiness() == null || dto.getHowDoYouReportThisBusiness().trim().isEmpty()
					|| dto.getGrossTurnover() == null || dto.getGrossTurnover().trim().isEmpty()
					|| dto.getDeclaredNetProfit() == null || dto.getDeclaredNetProfit().trim().isEmpty()) {

				throw new IllegalArgumentException(
						"Business reporting method, gross turnover and declared net profit are required");
			}
		}

		else if (dto.getIncomeSource().equalsIgnoreCase("Capital Gains")) {

			if (dto.getAssetType() == null || dto.getShortTermGains() == null
					|| dto.getShortTermGains().trim().isEmpty() || dto.getLongTermGains() == null
					|| dto.getLongTermGains().trim().isEmpty()) {

				throw new IllegalArgumentException("Asset type, short term gains and long term gains are required");
			}
		}

		else if (dto.getIncomeSource().equalsIgnoreCase("Other Sources")) {

			if ((dto.getSavingsInterest() == null || dto.getSavingsInterest().trim().isEmpty())
					&& (dto.getFdTermInterest() == null || dto.getFdTermInterest().trim().isEmpty())
					&& (dto.getDividendIncome() == null || dto.getDividendIncome().trim().isEmpty())
					&& (dto.getOtherMiscellaneous() == null || dto.getOtherMiscellaneous().trim().isEmpty())) {

				throw new IllegalArgumentException("At least one other source income is required");
			}
		}
	}
}
