package com.app.backend.features.branch.controllers;

import com.app.backend.common.response.ApiResponse;
import com.app.backend.features.branch.dtos.BranchDto;
import com.app.backend.features.branch.services.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BranchDto>>> getAll(@RequestParam(required = false) Long companyId) {
        return ResponseEntity.ok(ApiResponse.success(branchService.getAllBranches(companyId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(branchService.getBranchById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BranchDto>> create(@Valid @RequestBody BranchDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Tạo chi nhánh thành công", branchService.createBranch(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BranchDto>> update(@PathVariable Long id, @Valid @RequestBody BranchDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chi nhánh thành công", branchService.updateBranch(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        branchService.deleteBranch(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa chi nhánh thành công", null));
    }
}
