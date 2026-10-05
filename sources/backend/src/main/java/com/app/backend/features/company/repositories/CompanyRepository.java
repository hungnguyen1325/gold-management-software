package com.app.backend.features.company.repositories;

import com.app.backend.common.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByTaxCode(String taxCode);
    boolean existsByTaxCode(String taxCode);
    List<Company> findByDeletedAtIsNull();
}
