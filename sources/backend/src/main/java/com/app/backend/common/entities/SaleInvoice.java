package com.app.backend.common.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "sale_invoices", schema = "business")
public class SaleInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ColumnDefault("uuidv7()")
    @Column(name = "uuid", nullable = false)
    private UUID uuid = UUID.randomUUID();

    @NotNull
    @Column(name = "invoice_code", nullable = false, unique = true, length = 50)
    private String invoiceCode;

    @Column(name = "customer_name", length = 150)
    private String customerName;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @NotNull
    @Column(name = "sub_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal subTotal;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @NotNull
    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @NotNull
    @Column(name = "paid_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "change_amount", precision = 15, scale = 2)
    private BigDecimal changeAmount = BigDecimal.ZERO;

    @NotNull
    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod = "CASH"; // CASH, BANK_TRANSFER, SPLIT

    @NotNull
    @Column(name = "status", nullable = false, length = 30)
    private String status = "COMPLETED"; // COMPLETED, CANCELLED, PENDING

    @Column(name = "notes", length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_company")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_branch")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_employee")
    private Employee employee;

    @OneToMany(mappedBy = "saleInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleInvoiceItem> items = new ArrayList<>();

    @Column(name = "total_weight", precision = 10, scale = 4)
    private BigDecimal totalWeight = BigDecimal.ZERO;

    @Column(name = "total_pure_gold_weight", precision = 10, scale = 4)
    private BigDecimal totalPureGoldWeight = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
