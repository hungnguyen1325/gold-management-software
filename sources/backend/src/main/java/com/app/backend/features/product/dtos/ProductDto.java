package com.app.backend.features.product.dtos;

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
public class ProductDto {
    private Long id;

    @NotBlank(message = "Mã tem sản phẩm không được để trống")
    private String tagCode;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String category;

    @NotBlank(message = "Loại vàng không được để trống")
    private String goldType;

    @NotNull(message = "Trọng lượng tổng không được để trống")
    private BigDecimal totalWeight;

    private BigDecimal stoneWeight;
    private BigDecimal pureGoldWeight;

    @NotNull(message = "Tiền công không được để trống")
    private BigDecimal laborCost;

    private String locationCabinet;

    @NotNull(message = "Số lượng tồn không được để trống")
    private Integer stockQuantity;

    private Integer lowStockThreshold;
    private String status;
    private Long branchId;
    private String branchName;
    private OffsetDateTime createdAt;
}
