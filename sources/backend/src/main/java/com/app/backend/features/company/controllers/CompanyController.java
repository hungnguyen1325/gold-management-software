package com.app.backend.features.company.controllers;

import com.app.backend.common.response.ApiResponse;
import com.app.backend.features.company.dtos.CompanyDto;
import com.app.backend.features.company.services.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CompanyDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(companyService.getAllCompanies()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompanyById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyDto>> create(@Valid @RequestBody CompanyDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Tạo doanh nghiệp thành công", companyService.createCompany(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyDto>> update(@PathVariable Long id, @Valid @RequestBody CompanyDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật doanh nghiệp thành công", companyService.updateCompany(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa doanh nghiệp thành công", null));
    }
}
