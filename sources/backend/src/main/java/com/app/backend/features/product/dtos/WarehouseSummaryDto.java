package com.app.backend.features.product.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseSummaryDto {
    private BigDecimal totalPureGoldWeight; // Tổng lượng vàng (chỉ)
    private long totalJewelryPieces;        // Tổng số món
    private long totalDesigns;              // Số lượng mẫu
    private long lowStockCount;             // Số mặt hàng sắp hết
}
