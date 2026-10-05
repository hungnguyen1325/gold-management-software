package com.app.backend.features.goldprice.controllers;

import com.app.backend.common.response.ApiResponse;
import com.app.backend.features.goldprice.dtos.GoldPriceDto;
import com.app.backend.features.goldprice.services.GoldPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gold-prices")
@RequiredArgsConstructor
public class GoldPriceController {

    private final GoldPriceService goldPriceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoldPriceDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(goldPriceService.getAllPrices()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoldPriceDto>> update(@PathVariable Long id, @Valid @RequestBody GoldPriceDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bảng giá vàng thành công", goldPriceService.updatePrice(id, dto)));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<List<GoldPriceDto>>> sync() {
        return ResponseEntity.ok(ApiResponse.success("Đồng bộ giá thị trường thành công", goldPriceService.syncMarketPrices()));
    }
}
