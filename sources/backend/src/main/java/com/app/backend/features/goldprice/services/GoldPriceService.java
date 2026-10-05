package com.app.backend.features.goldprice.services;

import com.app.backend.common.entities.GoldPrice;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.goldprice.dtos.GoldPriceDto;
import com.app.backend.features.goldprice.repositories.GoldPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoldPriceService {

    private final GoldPriceRepository goldPriceRepository;

    @Transactional(readOnly = true)
    public List<GoldPriceDto> getAllPrices() {
        return goldPriceRepository.findAllByOrderByGoldTypeAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GoldPriceDto getPriceByGoldType(String goldType) {
        GoldPrice gp = goldPriceRepository.findByGoldType(goldType)
                .orElseThrow(() -> new AppException(ErrorCode.GOLD_PRICE_NOT_FOUND));
        return mapToDto(gp);
    }

    @Transactional
    public GoldPriceDto updatePrice(Long id, GoldPriceDto dto) {
        if (dto.getBuyPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_GOLD_PRICE, "Giá mua vào phải lớn hơn 0");
        }
        if (dto.getSellPrice().compareTo(dto.getBuyPrice()) < 0) {
            throw new AppException(ErrorCode.INVALID_GOLD_PRICE, "Giá bán ra không được nhỏ hơn giá mua vào");
        }

        GoldPrice gp = goldPriceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.GOLD_PRICE_NOT_FOUND));

        gp.setBuyPrice(dto.getBuyPrice());
        gp.setSellPrice(dto.getSellPrice());
        if (dto.getPurityPercent() != null) {
            gp.setPurityPercent(dto.getPurityPercent());
        }
        gp.setUpdatedAt(OffsetDateTime.now());

        GoldPrice updated = goldPriceRepository.save(gp);
        return mapToDto(updated);
    }

    @Transactional
    public List<GoldPriceDto> syncMarketPrices() {
        List<GoldPrice> list = goldPriceRepository.findAll();
        for (GoldPrice gp : list) {
            // Simulate slight market fluctuation +/- 10,000 VND
            long delta = (long) ((Math.random() - 0.48) * 20000);
            delta = (delta / 1000) * 1000;
            BigDecimal newBuy = gp.getBuyPrice().add(BigDecimal.valueOf(delta));
            BigDecimal newSell = gp.getSellPrice().add(BigDecimal.valueOf(delta));
            if (newSell.compareTo(newBuy) >= 0 && newBuy.compareTo(BigDecimal.ZERO) > 0) {
                gp.setBuyPrice(newBuy);
                gp.setSellPrice(newSell);
                gp.setUpdatedAt(OffsetDateTime.now());
            }
        }
        goldPriceRepository.saveAll(list);
        return getAllPrices();
    }

    private GoldPriceDto mapToDto(GoldPrice gp) {
        return GoldPriceDto.builder()
                .id(gp.getId())
                .goldType(gp.getGoldType())
                .purityPercent(gp.getPurityPercent())
                .buyPrice(gp.getBuyPrice())
                .sellPrice(gp.getSellPrice())
                .unit(gp.getUnit())
                .updatedAt(gp.getUpdatedAt() != null ? gp.getUpdatedAt() : gp.getCreatedAt())
                .build();
    }
}
