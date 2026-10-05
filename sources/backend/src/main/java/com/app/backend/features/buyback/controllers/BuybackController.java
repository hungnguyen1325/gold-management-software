package com.app.backend.features.buyback.controllers;

import com.app.backend.common.response.ApiResponse;
import com.app.backend.features.buyback.dtos.BuybackDto;
import com.app.backend.features.buyback.services.BuybackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buybacks")
@RequiredArgsConstructor
public class BuybackController {

    private final BuybackService buybackService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BuybackDto>>> getAll(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.success(buybackService.getAllTransactions(branchId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BuybackDto>> create(@Valid @RequestBody BuybackDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Lập phiếu mua lại vàng thành công", buybackService.createTransaction(dto)));
    }
}
