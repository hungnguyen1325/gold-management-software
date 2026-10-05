package com.app.backend.features.cashbook.controllers;

import com.app.backend.common.response.ApiResponse;
import com.app.backend.features.cashbook.dtos.CashbookDto;
import com.app.backend.features.cashbook.services.CashbookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cashbook")
@RequiredArgsConstructor
public class CashbookController {

    private final CashbookService cashbookService;

    @GetMapping("/active-shift")
    public ResponseEntity<ApiResponse<CashbookDto.ShiftResponse>> getActiveShift(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.success(cashbookService.getActiveShift(branchId)));
    }

    @GetMapping("/shifts")
    public ResponseEntity<ApiResponse<List<CashbookDto.ShiftResponse>>> getAllShifts() {
        return ResponseEntity.ok(ApiResponse.success(cashbookService.getAllShifts()));
    }

    @PostMapping("/shifts/open")
    public ResponseEntity<ApiResponse<CashbookDto.ShiftResponse>> openShift(@Valid @RequestBody CashbookDto.OpenShiftRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Mở ca làm việc thành công", cashbookService.openShift(request)));
    }

    @PostMapping("/shifts/{id}/close")
    public ResponseEntity<ApiResponse<CashbookDto.ShiftResponse>> closeShift(
            @PathVariable Long id,
            @Valid @RequestBody CashbookDto.CloseShiftRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Kết ca và bàn giao thành công", cashbookService.closeShift(id, request)));
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<CashbookDto.TransactionResponse>>> getTransactions(@RequestParam(required = false) Long shiftId) {
        return ResponseEntity.ok(ApiResponse.success(cashbookService.getTransactions(shiftId)));
    }

    @PostMapping("/transactions")
    public ResponseEntity<ApiResponse<CashbookDto.TransactionResponse>> createTransaction(@Valid @RequestBody CashbookDto.TransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Lập phiếu thu/chi thành công", cashbookService.createTransaction(request)));
    }
}
