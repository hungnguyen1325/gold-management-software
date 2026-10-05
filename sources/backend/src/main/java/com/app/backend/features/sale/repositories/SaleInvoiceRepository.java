package com.app.backend.features.sale.repositories;

import com.app.backend.common.entities.SaleInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleInvoiceRepository extends JpaRepository<SaleInvoice, Long> {
    Optional<SaleInvoice> findByInvoiceCode(String invoiceCode);
    List<SaleInvoice> findByBranchIdOrderByCreatedAtDesc(Long branchId);
    List<SaleInvoice> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM SaleInvoice s WHERE s.status = 'COMPLETED'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM SaleInvoice s WHERE s.status = 'COMPLETED' AND s.createdAt >= :startDate AND s.createdAt <= :endDate")
    BigDecimal sumRevenueBetween(OffsetDateTime startDate, OffsetDateTime endDate);

    @Query("SELECT COUNT(s) FROM SaleInvoice s WHERE s.status = 'COMPLETED'")
    long countCompletedInvoices();
}
