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
@Table(name = "products", schema = "business")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ColumnDefault("uuidv7()")
    @Column(name = "uuid", nullable = false)
    private UUID uuid = UUID.randomUUID();

    @NotNull
    @Column(name = "tag_code", nullable = false, unique = true, length = 50)
    private String tagCode;

    @NotNull
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "category", length = 100)
    private String category; // Nhẫn cưới, Dây chuyền, Lắc tay, Mặt dây, Kiềng...

    @NotNull
    @Column(name = "gold_type", nullable = false, length = 50)
    private String goldType; // 24K, 18K, 14K, 9999

    @NotNull
    @Column(name = "total_weight", nullable = false, precision = 10, scale = 4)
    private BigDecimal totalWeight; // Đơn vị: chỉ

    @Column(name = "stone_weight", precision = 10, scale = 4)
    private BigDecimal stoneWeight = BigDecimal.ZERO;

    @NotNull
    @Column(name = "pure_gold_weight", nullable = false, precision = 10, scale = 4)
    private BigDecimal pureGoldWeight;

    @NotNull
    @Column(name = "labor_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal laborCost = BigDecimal.ZERO;

    @Column(name = "location_cabinet", length = 100)
    private String locationCabinet = "Tủ 01";

    @NotNull
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 1;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold = 3;

    @Column(name = "status", length = 30)
    private String status = "AVAILABLE"; // AVAILABLE, LOW_STOCK, OUT_OF_STOCK

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_company")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_branch")
    private Branch branch;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;
}
