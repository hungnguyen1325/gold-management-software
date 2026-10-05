package com.app.backend;

import com.app.backend.common.entities.*;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.branch.repositories.BranchRepository;
import com.app.backend.features.cashbook.repositories.CashTransactionRepository;
import com.app.backend.features.cashbook.repositories.CashbookShiftRepository;
import com.app.backend.features.goldprice.repositories.GoldPriceRepository;
import com.app.backend.features.product.repositories.ProductRepository;
import com.app.backend.features.sale.dtos.SaleDto;
import com.app.backend.features.sale.repositories.SaleInvoiceRepository;
import com.app.backend.features.sale.services.SaleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SaleServiceTest {

    @Mock
    private SaleInvoiceRepository saleInvoiceRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private GoldPriceRepository goldPriceRepository;
    @Mock
    private BranchRepository branchRepository;
    @Mock
    private CashbookShiftRepository shiftRepository;
    @Mock
    private CashTransactionRepository cashTransactionRepository;

    @InjectMocks
    private SaleService saleService;

    @Test
    @DisplayName("UT_SALE_001: Từ chối thanh toán khi số lượng yêu cầu vượt tồn kho")
    void testInsufficientStock() {
        Product p = new Product();
        p.setId(1L);
        p.setTagCode("V24K-01");
        p.setName("Nhẫn vàng 24K");
        p.setGoldType("24K");
        p.setStockQuantity(2); // Only 2 in stock

        when(productRepository.findById(1L)).thenReturn(Optional.of(p));
        when(branchRepository.findByDeletedAtIsNull()).thenReturn(Collections.emptyList());

        SaleDto.CreateRequest request = SaleDto.CreateRequest.builder()
                .items(List.of(new SaleDto.ItemRequest(1L, "V24K-01", 5))) // Request 5
                .paidAmount(new BigDecimal("50000000"))
                .build();

        AppException ex = assertThrows(AppException.class, () -> saleService.createSaleInvoice(request));
        assertEquals(ErrorCode.INSUFFICIENT_STOCK, ex.getErrorCode());
    }

    @Test
    @DisplayName("UT_SALE_002: Tính đúng giá trị đơn hàng = (Trọng lượng * Đơn giá) + Tiền công và trừ tồn kho")
    void testSaleInvoiceCalculation() {
        Product p = new Product();
        p.setId(1L);
        p.setTagCode("V24K-01");
        p.setName("Nhẫn vàng 24K");
        p.setGoldType("24K");
        p.setPureGoldWeight(new BigDecimal("1.0000")); // 1 chỉ
        p.setLaborCost(new BigDecimal("200000"));      // 200,000 đ
        p.setStockQuantity(10);
        p.setLowStockThreshold(3);

        GoldPrice gp = new GoldPrice();
        gp.setGoldType("24K");
        gp.setSellPrice(new BigDecimal("8500000")); // 8,500,000 đ/chỉ

        when(productRepository.findById(1L)).thenReturn(Optional.of(p));
        when(goldPriceRepository.findByGoldType("24K")).thenReturn(Optional.of(gp));
        when(branchRepository.findByDeletedAtIsNull()).thenReturn(Collections.emptyList());
        when(shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN")).thenReturn(Optional.empty());
        when(saleInvoiceRepository.save(any(SaleInvoice.class))).thenAnswer(i -> {
            SaleInvoice inv = i.getArgument(0);
            inv.setId(100L);
            return inv;
        });

        // 1 chỉ * 8,500,000 + 200,000 = 8,700,000 đ
        SaleDto.CreateRequest request = SaleDto.CreateRequest.builder()
                .customerName("Nguyễn Văn An")
                .items(List.of(new SaleDto.ItemRequest(1L, "V24K-01", 1)))
                .paidAmount(new BigDecimal("9000000"))
                .paymentMethod("CASH")
                .build();

        SaleDto.InvoiceResponse response = saleService.createSaleInvoice(request);

        assertNotNull(response);
        assertEquals(0, new BigDecimal("8700000").compareTo(response.getTotalAmount()));
        assertEquals(0, new BigDecimal("300000").compareTo(response.getChangeAmount()));
        assertEquals(9, p.getStockQuantity()); // Deducted from 10 to 9
        verify(productRepository, times(1)).save(p);
    }
}
