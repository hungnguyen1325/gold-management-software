package com.app.backend.features.company.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {
    private Long id;
    
    @NotBlank(message = "Mã số thuế không được để trống")
    private String taxCode;
    
    @NotBlank(message = "Tên doanh nghiệp không được để trống")
    private String name;
    
    private String address;
    private String phone;
    private String email;
    private String status;
    private OffsetDateTime createdAt;
}
