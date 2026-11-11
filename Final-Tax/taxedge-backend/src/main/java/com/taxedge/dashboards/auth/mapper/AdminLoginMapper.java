package com.taxedge.dashboards.auth.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.taxedge.dashboards.auth.dto.AdminLoginDto;
import com.taxedge.dashboards.auth.entity.AdminLogin;

/**
 * MapStruct mapper for converting between AdminLogin entity and AdminLoginDto.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdminLoginMapper {

    AdminLogin toEntity(AdminLoginDto dto);

    @Mapping(target = "password", ignore = true)
    AdminLoginDto toDto(AdminLogin entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntityFromDto(AdminLoginDto dto, @MappingTarget AdminLogin entity);
}