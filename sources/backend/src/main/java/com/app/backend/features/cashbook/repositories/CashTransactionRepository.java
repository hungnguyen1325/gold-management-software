package com.app.backend.features.cashbook.repositories;

import com.app.backend.common.entities.CashTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CashTransactionRepository extends JpaRepository<CashTransaction, Long> {
    Optional<CashTransaction> findByVoucherCode(String voucherCode);
    List<CashTransaction> findByShiftIdOrderByCreatedAtDesc(Long shiftId);
    List<CashTransaction> findAllByOrderByCreatedAtDesc();
}
