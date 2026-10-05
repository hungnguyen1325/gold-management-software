package com.app.backend.features.report.dtos;

import com.app.backend.features.sale.dtos.SaleDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private BigDecimal totalBuybackAmount;
    private BigDecimal totalPureGoldInventory;
    private long totalJewelryPieces;
    private long lowStockCount;
    private BigDecimal currentCashBalance;
    private List<SaleDto.InvoiceResponse> recentSales;
}
