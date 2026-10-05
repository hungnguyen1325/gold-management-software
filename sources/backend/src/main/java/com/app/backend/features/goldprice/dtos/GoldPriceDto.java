package com.app.backend.features.goldprice.dtos;

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
public class GoldPriceDto {
    private Long id;
    
    @NotNull(message = "Loại vàng không được để trống")
    private String goldType;
    
    private BigDecimal purityPercent;
    
    @NotNull(message = "Giá mua vào không được để trống")
    private BigDecimal buyPrice;
    
    @NotNull(message = "Giá bán ra không được để trống")
    private BigDecimal sellPrice;
    
    private String unit;
    private OffsetDateTime updatedAt;
}
