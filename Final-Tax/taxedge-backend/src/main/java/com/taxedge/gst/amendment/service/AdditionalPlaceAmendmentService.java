package com.taxedge.gst.amendment.service;

import com.taxedge.gst.amendment.dto.AdditionalPlaceAmendmentViewDto;
import com.taxedge.gst.registration.enums.NatureOfPremises;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

public interface AdditionalPlaceAmendmentService {

    List<AdditionalPlaceAmendmentViewDto> getExistingAdditionalPlaces(String gstId);

    AdditionalPlaceAmendmentViewDto submitAdditionalPlace(String gstId, String customerId, String address, String city, String pinCode,
                                                         NatureOfPremises natureOfPremises, MultipartFile file) throws IOException;

    AdditionalPlaceAmendmentViewDto getAmendmentById(String id);

    AdditionalPlaceAmendmentViewDto updateAdditionalPlace(String id, String address, String city, String pinCode,
                                                         NatureOfPremises natureOfPremises, MultipartFile file) throws IOException;

    String submitAmendment(String id, String gstId, String pushToken);
}
