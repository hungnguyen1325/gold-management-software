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
@Table(name = "cashbook_shifts", schema = "business")
public class CashbookShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ColumnDefault("uuidv7()")
    @Column(name = "uuid", nullable = false)
    private UUID uuid = UUID.randomUUID();

    @NotNull
    @Column(name = "shift_code", nullable = false, unique = true, length = 50)
    private String shiftCode;

    @Column(name = "shift_name", length = 100)
    private String shiftName; // Ca 1 (Sáng), Ca 2 (Chiều)

    @NotNull
    @Column(name = "initial_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal initialBalance = BigDecimal.ZERO;

    @NotNull
    @Column(name = "total_receipts", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalReceipts = BigDecimal.ZERO;

    @NotNull
    @Column(name = "total_expenses", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalExpenses = BigDecimal.ZERO;

    @NotNull
    @Column(name = "system_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal systemBalance = BigDecimal.ZERO;

    @Column(name = "counted_cash", precision = 15, scale = 2)
    private BigDecimal countedCash;

    @Column(name = "difference", precision = 15, scale = 2)
    private BigDecimal difference = BigDecimal.ZERO;

    @NotNull
    @Column(name = "status", nullable = false, length = 20)
    private String status = "OPEN"; // OPEN, CLOSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_branch")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_employee_open")
    private Employee employeeOpen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_employee_close")
    private Employee employeeClose;

    @NotNull
    @Column(name = "opened_at", nullable = false)
    private OffsetDateTime openedAt = OffsetDateTime.now();

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;
}
