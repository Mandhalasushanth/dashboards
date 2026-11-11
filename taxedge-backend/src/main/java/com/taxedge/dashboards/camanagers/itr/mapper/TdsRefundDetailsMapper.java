package com.taxedge.dashboards.camanagers.itr.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.taxedge.customer.entity.Customer;
import com.taxedge.dashboards.camanagers.gst.dto.CustomerDetailsDto;
import com.taxedge.dashboards.camanagers.itr.dto.TdsRefundDetailsDto;
import com.taxedge.itr.tdsrefund.entity.TdsRefund;

@Mapper(componentModel = "spring")
public interface TdsRefundDetailsMapper {

    @Mapping(target = "customerId", source = "custId")
    CustomerDetailsDto toCustomerDetailsDto(Customer customer);

    TdsRefundDetailsDto toDto(TdsRefund entity);

    List<TdsRefundDetailsDto> toDtoList(List<TdsRefund> entities);
}

