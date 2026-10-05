package com.app.backend.features.buyback.repositories;

import com.app.backend.common.entities.BuybackTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BuybackTransactionRepository extends JpaRepository<BuybackTransaction, Long> {
    Optional<BuybackTransaction> findByTransactionCode(String transactionCode);
    List<BuybackTransaction> findByBranchIdOrderByCreatedAtDesc(Long branchId);
    List<BuybackTransaction> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BuybackTransaction b WHERE b.status = 'COMPLETED'")
    BigDecimal sumTotalBuybackAmount();

    @Query("SELECT COALESCE(SUM(b.weight), 0) FROM BuybackTransaction b WHERE b.status = 'COMPLETED'")
    BigDecimal sumTotalBuybackWeight();
}
