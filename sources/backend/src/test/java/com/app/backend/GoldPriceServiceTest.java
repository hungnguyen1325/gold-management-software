package com.app.backend;

import com.app.backend.common.entities.GoldPrice;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.goldprice.dtos.GoldPriceDto;
import com.app.backend.features.goldprice.repositories.GoldPriceRepository;
import com.app.backend.features.goldprice.services.GoldPriceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class GoldPriceServiceTest {

    @Mock
    private GoldPriceRepository goldPriceRepository;

    @InjectMocks
    private GoldPriceService goldPriceService;

    @Test
    @DisplayName("UT_GOLD_001: Từ chối lưu khi giá bán nhỏ hơn giá mua vào")
    void testSellPriceLessThanBuyPrice() {
        GoldPriceDto dto = GoldPriceDto.builder()
                .goldType("24K")
                .buyPrice(new BigDecimal("8500000"))
                .sellPrice(new BigDecimal("8400000")) // Sell < Buy
                .build();

        AppException ex = assertThrows(AppException.class, () -> goldPriceService.updatePrice(1L, dto));
        assertEquals(ErrorCode.INVALID_GOLD_PRICE, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("không được nhỏ hơn"));
    }

    @Test
    @DisplayName("UT_GOLD_002: Từ chối lưu khi giá mua vào nhỏ hơn hoặc bằng 0")
    void testBuyPriceZeroOrNegative() {
        GoldPriceDto dto = GoldPriceDto.builder()
                .goldType("24K")
                .buyPrice(BigDecimal.ZERO)
                .sellPrice(new BigDecimal("8500000"))
                .build();

        AppException ex = assertThrows(AppException.class, () -> goldPriceService.updatePrice(1L, dto));
        assertEquals(ErrorCode.INVALID_GOLD_PRICE, ex.getErrorCode());
    }

    @Test
    @DisplayName("UT_GOLD_003: Cập nhật thành công khi giá bán >= giá mua vào")
    void testUpdatePriceSuccess() {
        GoldPrice existing = new GoldPrice();
        existing.setId(1L);
        existing.setGoldType("24K");
        existing.setBuyPrice(new BigDecimal("8400000"));
        existing.setSellPrice(new BigDecimal("8600000"));

        when(goldPriceRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(goldPriceRepository.save(any(GoldPrice.class))).thenAnswer(i -> i.getArgument(0));

        GoldPriceDto dto = GoldPriceDto.builder()
                .goldType("24K")
                .buyPrice(new BigDecimal("8500000"))
                .sellPrice(new BigDecimal("8700000"))
                .purityPercent(new BigDecimal("99.99"))
                .build();

        GoldPriceDto result = goldPriceService.updatePrice(1L, dto);

        assertNotNull(result);
        assertEquals(new BigDecimal("8500000"), result.getBuyPrice());
        assertEquals(new BigDecimal("8700000"), result.getSellPrice());
        verify(goldPriceRepository, times(1)).save(any(GoldPrice.class));
    }
}
