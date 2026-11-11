package com.taxedge.gst.filing.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taxedge.customer.entity.Customer;
import com.taxedge.customer.repository.CustomerRepository;
import com.taxedge.gst.filing.dto.GstFilingDto;
import com.taxedge.gst.filing.entity.GstFiling;
import com.taxedge.gst.filing.enums.FilingType;
import com.taxedge.gst.filing.enums.TaxCalculationMethod;
import com.taxedge.exception.ResourceNotFoundException;
import com.taxedge.gst.filing.mapper.GstFilingMapper;
import com.taxedge.gst.filing.repository.GstFilingRepository;
import com.taxedge.gst.registration.enums.RegisterationStatus;
import com.taxedge.messaging.service.EmailService;
import com.taxedge.notification.service.FcmNotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GstFilingServiceImpl implements GstFilingService {

	private final GstFilingRepository gstFilingRepository;
	private final CustomerRepository customerRepository;
	private final GstFilingMapper gstFilingMapper;
	private final FcmNotificationService fcmNotificationService;
	private final EmailService emailService;

	@Override
	public String createFiling(GstFilingDto dto) {

		normalize(dto);

		validateFiling(dto);

		boolean alreadyExists = gstFilingRepository.existsByGstinAndFinancialYearAndFilingPeriodAndReturnType(
				dto.getGstin(), dto.getFinancialYear(), dto.getFilingPeriod(), dto.getReturnType());

		if (alreadyExists) {
			throw new IllegalArgumentException(
					"GST filing already exists for the given GSTIN, financial year, filing period and return type");
		}

		Customer customer = customerRepository.findById(dto.getCustomerId())
				.orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

		String filingId = generateFilingId();

		GstFiling filing = gstFilingMapper.toEntity(dto);

		filing.setGstfilingId(filingId);
		filing.setCustomer(customer);
		filing.setCreatedAt(LocalDateTime.now());

		gstFilingRepository.save(filing);

		return "GST filing created successfully. Filing ID: " + filingId;
	}

	@Override
	@Transactional(readOnly = true)
	public GstFilingDto getFilingById(String id) {

		GstFiling filing = gstFilingRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("GST filing not found with ID: " + id));

		return gstFilingMapper.toDto(filing);
	}

	@Override
	public String updateFiling(String id, GstFilingDto dto) {

		normalize(dto);

		GstFiling filing = gstFilingRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("GST filing not found with ID: " + id));

		if (!filing.getGstin().equals(dto.getGstin())) {
			throw new IllegalArgumentException("GST filing does not belong to GSTIN: " + dto.getGstin());
		}

		validateFiling(dto);

		boolean duplicateExists = gstFilingRepository.existsByGstinAndFinancialYearAndFilingPeriodAndReturnType(
				dto.getGstin(), dto.getFinancialYear(), dto.getFilingPeriod(), dto.getReturnType());

		if (duplicateExists && !(filing.getFinancialYear().equals(dto.getFinancialYear())
				&& filing.getFilingPeriod().equals(dto.getFilingPeriod())
				&& filing.getReturnType() == dto.getReturnType())) {

			throw new IllegalArgumentException(
					"Another GST filing already exists for the given GSTIN, financial year, filing period and return type");
		}

		gstFilingMapper.updateEntity(dto, filing);

		if (dto.getTaxCalculationMethod() != null) {
			switch (dto.getTaxCalculationMethod()) {
			case ESTIMATION_FIGURES:
				if (dto.getEstimatedTaxableSales() != null) {
					filing.setEstimatedTaxableSales(dto.getEstimatedTaxableSales());
				}
				if (dto.getEstimatedTaxablePurchases() != null) {
					filing.setEstimatedTaxablePurchases(dto.getEstimatedTaxablePurchases());
				}
				if (dto.getEstimatedEligibleItc() != null) {
					filing.setEstimatedEligibleItc(dto.getEstimatedEligibleItc());
				}
				break;
			case FINSOLZ_CA_CALCULATION:
				filing.setEstimatedTaxableSales(null);
				filing.setEstimatedTaxablePurchases(null);
				filing.setEstimatedEligibleItc(null);
				break;
			default:
				break;
			}
		}

		gstFilingRepository.save(filing);

		return "GST filing updated successfully";
	}

	@Override
	public String deleteFiling(String id) {

		GstFiling filing = gstFilingRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("GST filing not found with ID: " + id));

		gstFilingRepository.delete(filing);

		return "GST filing deleted successfully";
	}

	private void normalize(GstFilingDto dto) {

		if (dto.getGstin() != null) {
			dto.setGstin(dto.getGstin().trim().toUpperCase());
		}

		if (dto.getCustomerId() != null) {
			dto.setCustomerId(dto.getCustomerId().trim());
		}

		if (dto.getFinancialYear() != null) {
			dto.setFinancialYear(dto.getFinancialYear().trim());
		}

		if (dto.getFilingPeriod() != null) {
			dto.setFilingPeriod(dto.getFilingPeriod().trim());
		}

		if (dto.getTaxCalculationMethod() == null && (dto.getEstimatedTaxableSales() != null
				|| dto.getEstimatedTaxablePurchases() != null || dto.getEstimatedEligibleItc() != null)) {
			dto.setTaxCalculationMethod(TaxCalculationMethod.ESTIMATION_FIGURES);
		}
	}

	private void validateFiling(GstFilingDto dto) {

		if (dto.getGstin() == null || dto.getGstin().isBlank()) {
			throw new IllegalArgumentException("GSTIN is required");
		}

		if (!dto.getGstin().matches("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$")) {
			throw new IllegalArgumentException("Invalid GSTIN format");
		}

		if (dto.getFilingType() != null) {
			switch (dto.getFilingType()) {
			case NIL_RETURN:
				return;
			case REGULAR:
				if (dto.getTaxCalculationMethod() == null) {
					throw new IllegalArgumentException("Tax calculation method is required for regular filing");
				}
				switch (dto.getTaxCalculationMethod()) {
				case ESTIMATION_FIGURES:
					if (dto.getEstimatedTaxableSales() == null || dto.getEstimatedTaxablePurchases() == null
							|| dto.getEstimatedEligibleItc() == null) {
						throw new IllegalArgumentException(
								"Estimated taxable sales, estimated taxable purchases and estimated eligible ITC are required");
					}
					break;
				case FINSOLZ_CA_CALCULATION:
				default:
					break;
				}
				break;
			default:
				break;
			}
		}
	}

	private String generateFilingId() {

		return "FIL" + UUID.randomUUID().toString().replace("-", "");
	}

	@Override
	public String submitFiling(String filingId, String pushToken) {

		GstFiling filing = gstFilingRepository.findById(filingId)
				.orElseThrow(() -> new ResourceNotFoundException("GST filing not found with id: " + filingId));

		RegisterationStatus currentStatus = filing.getStatus();
		if (currentStatus != null && currentStatus != RegisterationStatus.DRAFT && currentStatus != RegisterationStatus.REJECTED) {
			throw new IllegalStateException(
					"GST filing " + filingId + " cannot be submitted. Current status: " + currentStatus);
		}

		filing.setStatus(RegisterationStatus.SUBMITTED);
		filing.setSubmittedAt(LocalDateTime.now());
		gstFilingRepository.save(filing);

		Customer customer = filing.getCustomer();

		// Save token if new or changed
		if (pushToken != null && !pushToken.isBlank() && customer != null && !pushToken.equals(customer.getPushToken())) {
			customer.setPushToken(pushToken);
			customerRepository.save(customer);
		}

		String resolvedToken = (pushToken != null && !pushToken.isBlank())
				? pushToken
				: (customer != null ? customer.getPushToken() : null);

		String applicantName = (customer != null && customer.getName() != null && !customer.getName().isBlank())
				? customer.getName()
				: filing.getGstin();

		if (resolvedToken != null && !resolvedToken.isBlank() && fcmNotificationService != null) {
			try {
				fcmNotificationService.sendSuccessNotification(resolvedToken, applicantName);
			} catch (Exception ex) {
				log.error("Push notification failed for GST filing id {}", filingId, ex);
			}
		}

		// Confirmation email
		try {
			if (customer != null && customer.getEmail() != null && !customer.getEmail().isBlank() && emailService != null) {
				String recipientEmail = customer.getEmail();
				String recipientName = (customer.getName() != null && !customer.getName().isBlank()) ? customer.getName() : "Valued Customer";
				emailService.sendRegistrationEmail(recipientEmail, recipientName);
			}
		} catch (Exception ex) {
			log.error("Confirmation email failed for GST filing id {}", filingId, ex);
		}

		return "GST filing submitted successfully. Filing ID: " + filingId;
	}
}
