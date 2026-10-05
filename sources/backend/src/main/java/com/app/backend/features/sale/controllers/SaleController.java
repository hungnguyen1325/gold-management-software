package com.app.backend.features.sale.controllers;

import com.app.backend.common.response.ApiResponse;
import com.app.backend.features.sale.dtos.SaleDto;
import com.app.backend.features.sale.services.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SaleDto.InvoiceResponse>>> getAll(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.success(saleService.getAllInvoices(branchId)));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<SaleDto.InvoiceResponse>> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(saleService.getByInvoiceCode(code)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SaleDto.InvoiceResponse>> create(@Valid @RequestBody SaleDto.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Thanh toán đơn hàng thành công", saleService.createSaleInvoice(request)));
    }
}
