package com.app.backend.features.cashbook.repositories;

import com.app.backend.common.entities.CashbookShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CashbookShiftRepository extends JpaRepository<CashbookShift, Long> {
    Optional<CashbookShift> findByShiftCode(String shiftCode);
    Optional<CashbookShift> findFirstByBranchIdAndStatusOrderByOpenedAtDesc(Long branchId, String status);
    Optional<CashbookShift> findFirstByStatusOrderByOpenedAtDesc(String status);
    List<CashbookShift> findAllByOrderByOpenedAtDesc();
}
