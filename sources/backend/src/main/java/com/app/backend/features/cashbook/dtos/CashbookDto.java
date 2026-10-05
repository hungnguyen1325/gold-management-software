package com.app.backend.features.cashbook.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class CashbookDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShiftResponse {
        private Long id;
        private String shiftCode;
        private String shiftName;
        private BigDecimal initialBalance;
        private BigDecimal totalReceipts;
        private BigDecimal totalExpenses;
        private BigDecimal systemBalance;
        private BigDecimal countedCash;
        private BigDecimal difference;
        private String status;
        private Long branchId;
        private String branchName;
        private OffsetDateTime openedAt;
        private OffsetDateTime closedAt;
        private List<TransactionResponse> transactions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpenShiftRequest {
        @NotNull(message = "Số tiền đầu ca không được để trống")
        private BigDecimal initialBalance;
        private String shiftName;
        private Long branchId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CloseShiftRequest {
        @NotNull(message = "Số tiền kiểm đếm thực tế không được để trống")
        private BigDecimal countedCash;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionRequest {
        @NotNull(message = "Loại giao dịch (RECEIPT/EXPENSE) không được để trống")
        private String type; // RECEIPT, EXPENSE

        private String category;

        @NotNull(message = "Số tiền không được để trống")
        private BigDecimal amount;

        private String paymentMethod;
        private String payerReceiver;
        private String notes;
        private Long branchId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionResponse {
        private Long id;
        private String voucherCode;
        private String type;
        private String category;
        private BigDecimal amount;
        private String paymentMethod;
        private String referenceCode;
        private String payerReceiver;
        private String notes;
        private OffsetDateTime createdAt;
    }
}
