package com.app.backend.features.sale.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class SaleDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemRequest {
        @NotNull(message = "Sản phẩm không được để trống")
        private Long productId;
        
        private String tagCode;

        @NotNull(message = "Số lượng không được để trống")
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String customerName;
        private String customerPhone;

        @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm")
        private List<ItemRequest> items;

        private BigDecimal discountAmount;
        
        @NotNull(message = "Số tiền khách thanh toán không được để trống")
        private BigDecimal paidAmount;

        private String paymentMethod; // CASH, BANK_TRANSFER
        private String notes;
        private Long branchId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String tagCode;
        private String productName;
        private String goldType;
        private BigDecimal totalWeight;
        private BigDecimal stoneWeight;
        private BigDecimal pureGoldWeight;
        private Integer quantity;
        private BigDecimal goldPriceRate;
        private BigDecimal laborCost;
        private BigDecimal itemTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceResponse {
        private Long id;
        private String invoiceCode;
        private String customerName;
        private String customerPhone;
        private BigDecimal totalWeight;
        private BigDecimal totalPureGoldWeight;
        private BigDecimal subTotal;
        private BigDecimal discountAmount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal changeAmount;
        private String paymentMethod;
        private String status;
        private String notes;
        private Long branchId;
        private String branchName;
        private List<ItemResponse> items;
        private OffsetDateTime createdAt;
    }
}
