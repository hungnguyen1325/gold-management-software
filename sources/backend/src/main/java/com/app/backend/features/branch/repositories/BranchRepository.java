package com.app.backend.features.branch.repositories;

import com.app.backend.common.entities.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByCompanyIdAndDeletedAtIsNull(Long companyId);
    List<Branch> findByDeletedAtIsNull();
}
