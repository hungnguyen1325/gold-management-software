package com.app.backend.features.report.services;

import com.app.backend.common.entities.CashbookShift;
import com.app.backend.features.buyback.repositories.BuybackTransactionRepository;
import com.app.backend.features.cashbook.repositories.CashbookShiftRepository;
import com.app.backend.features.product.repositories.ProductRepository;
import com.app.backend.features.report.dtos.DashboardStatsDto;
import com.app.backend.features.sale.dtos.SaleDto;
import com.app.backend.features.sale.repositories.SaleInvoiceRepository;
import com.app.backend.features.sale.services.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SaleInvoiceRepository saleInvoiceRepository;
    private final BuybackTransactionRepository buybackRepository;
    private final ProductRepository productRepository;
    private final CashbookShiftRepository shiftRepository;
    private final SaleService saleService;

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(Long branchId) {
        BigDecimal revenue = saleInvoiceRepository.sumTotalRevenue();
        long completedInvoices = saleInvoiceRepository.countCompletedInvoices();
        BigDecimal buyback = buybackRepository.sumTotalBuybackAmount();
        BigDecimal totalGold = productRepository.sumTotalPureGoldWeight();
        long totalPieces = productRepository.countTotalJewelryPieces();
        long lowStock = productRepository.findByStockQuantityLessThanEqualAndDeletedAtIsNull(3).size();

        Optional<CashbookShift> activeShift = shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN");
        BigDecimal currentCash = activeShift.map(CashbookShift::getSystemBalance).orElse(BigDecimal.ZERO);

        List<SaleDto.InvoiceResponse> recentSales = saleService.getAllInvoices(branchId);
        if (recentSales.size() > 5) {
            recentSales = recentSales.subList(0, 5);
        }

        return DashboardStatsDto.builder()
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .totalOrders(completedInvoices)
                .totalBuybackAmount(buyback != null ? buyback : BigDecimal.ZERO)
                .totalPureGoldInventory(totalGold != null ? totalGold : BigDecimal.ZERO)
                .totalJewelryPieces(totalPieces)
                .lowStockCount(lowStock)
                .currentCashBalance(currentCash)
                .recentSales(recentSales)
                .build();
    }
}
