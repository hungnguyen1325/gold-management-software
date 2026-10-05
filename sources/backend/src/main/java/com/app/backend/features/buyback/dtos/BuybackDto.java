package com.app.backend.features.buyback.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class BuybackDto {
    private Long id;
    private String transactionCode;
    
    private String customerName;
    private String customerPhone;

    @NotBlank(message = "Loại vàng không được để trống")
    private String goldType;

    @NotNull(message = "Trọng lượng vàng phải lớn hơn 0")
    private BigDecimal weight;

    private BigDecimal unitPrice;
    private BigDecimal deductionAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String status;
    private String notes;
    private Long branchId;
    private String branchName;
    private OffsetDateTime createdAt;
}
