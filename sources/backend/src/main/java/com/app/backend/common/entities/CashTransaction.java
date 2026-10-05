package com.app.backend.common.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "cash_transactions", schema = "business")
public class CashTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ColumnDefault("uuidv7()")
    @Column(name = "uuid", nullable = false)
    private UUID uuid = UUID.randomUUID();

    @NotNull
    @Column(name = "voucher_code", nullable = false, unique = true, length = 50)
    private String voucherCode; // PT-0001 (Phiếu thu), PC-0001 (Phiếu chi)

    @NotNull
    @Column(name = "type", nullable = false, length = 20)
    private String type; // RECEIPT (Thu), EXPENSE (Chi)

    @Column(name = "category", length = 100)
    private String category; // Bán hàng, Mua lại vàng, Tiền điện nước, Tạm ứng...

    @NotNull
    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @NotNull
    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod = "CASH"; // CASH, BANK_TRANSFER

    @Column(name = "reference_code", length = 50)
    private String referenceCode; // Mã HĐ Bán hoặc Phiếu Mua nếu có

    @Column(name = "payer_receiver", length = 150)
    private String payerReceiver; // Người nộp / Người nhận

    @Column(name = "notes", length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_shift")
    private CashbookShift shift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_branch")
    private Branch branch;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
