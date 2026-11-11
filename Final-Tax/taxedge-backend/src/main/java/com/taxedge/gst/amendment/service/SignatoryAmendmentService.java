package com.taxedge.gst.amendment.service;

import java.io.IOException;
import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

import com.taxedge.gst.amendment.dto.SignatoryAmendmentViewDto;

public interface SignatoryAmendmentService {

    SignatoryAmendmentViewDto getExistingSignatoryDetails(String gstId);

    SignatoryAmendmentViewDto submitSignatoryAmendment(String gstId, String customerId, String signatoryName, String signatoryPan,
                                                       LocalDate signatoryDob, String designation, String signatoryMobile,
                                                       String signatoryEmail, MultipartFile file) throws IOException;

    SignatoryAmendmentViewDto getAmendmentById(String id);

    SignatoryAmendmentViewDto updateSignatoryAmendment(String id, String signatoryName, String signatoryPan,
                                                       LocalDate signatoryDob, String designation, String signatoryMobile,
                                                       String signatoryEmail, MultipartFile file) throws IOException;

    String submitAmendment(String id, String gstId, String pushToken);

}
