package com.app.backend.features.employee.repositories;

import com.app.backend.common.entities.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByCompanyIdAndDeletedAtIsNull(Long companyId);
    List<Employee> findByBranchIdAndDeletedAtIsNull(Long branchId);
    List<Employee> findByDeletedAtIsNull();
    Optional<Employee> findByAccountId(Long accountId);
}
