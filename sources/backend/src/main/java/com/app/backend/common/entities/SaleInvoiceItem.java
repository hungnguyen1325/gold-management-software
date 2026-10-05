package com.app.backend.common.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "sale_invoice_items", schema = "business")
public class SaleInvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_sale_invoice", nullable = false)
    private SaleInvoice saleInvoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_product", nullable = false)
    private Product product;

    @NotNull
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @NotNull
    @Column(name = "gold_price_rate", nullable = false, precision = 15, scale = 2)
    private BigDecimal goldPriceRate;

    @NotNull
    @Column(name = "labor_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal laborCost;

    @NotNull
    @Column(name = "item_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal itemTotal;

    @Column(name = "total_weight", precision = 10, scale = 4)
    private BigDecimal totalWeight;

    @Column(name = "stone_weight", precision = 10, scale = 4)
    private BigDecimal stoneWeight = BigDecimal.ZERO;

    @Column(name = "pure_gold_weight", precision = 10, scale = 4)
    private BigDecimal pureGoldWeight;
}
