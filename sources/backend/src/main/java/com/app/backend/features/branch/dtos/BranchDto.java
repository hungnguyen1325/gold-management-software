package com.app.backend.features.branch.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchDto {
    private Long id;
    private Long companyId;
    private String companyName;
    private String taxCode;
    
    @NotBlank(message = "Tên chi nhánh không được để trống")
    private String name;
    
    private String address;
    private String phone;
    private String email;
    private String managerName;
    private int employeeCount;
    private BigDecimal monthlyRevenue;
    private String status;
    private OffsetDateTime createdAt;
}
