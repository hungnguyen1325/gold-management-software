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
@Table(name = "gold_prices", schema = "business")
public class GoldPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ColumnDefault("uuidv7()")
    @Column(name = "uuid", nullable = false)
    private UUID uuid = UUID.randomUUID();

    @NotNull
    @Column(name = "gold_type", nullable = false, length = 50)
    private String goldType; // 24K, 18K, 14K, 9999, SJC

    @Column(name = "purity_percent", precision = 5, scale = 2)
    private BigDecimal purityPercent; // 99.99, 75.00, 58.30

    @NotNull
    @Column(name = "buy_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal buyPrice;

    @NotNull
    @Column(name = "sell_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal sellPrice;

    @Column(name = "unit", length = 20)
    private String unit = "chỉ";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_company")
    private Company company;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
