package com.app.backend.features.product.repositories;

import com.app.backend.common.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByTagCode(String tagCode);
    boolean existsByTagCode(String tagCode);
    
    List<Product> findByBranchIdAndDeletedAtIsNull(Long branchId);
    List<Product> findByDeletedAtIsNull();
    List<Product> findByStockQuantityLessThanEqualAndDeletedAtIsNull(Integer threshold);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deletedAt IS NULL")
    long countTotalProducts();

    @Query("SELECT COALESCE(SUM(p.stockQuantity), 0) FROM Product p WHERE p.deletedAt IS NULL")
    long countTotalJewelryPieces();

    @Query("SELECT COALESCE(SUM(p.pureGoldWeight * p.stockQuantity), 0) FROM Product p WHERE p.deletedAt IS NULL")
    BigDecimal sumTotalPureGoldWeight();
}
