package com.app.backend.features.product.controllers;

import com.app.backend.common.response.ApiResponse;
import com.app.backend.features.product.dtos.ProductDto;
import com.app.backend.features.product.dtos.WarehouseSummaryDto;
import com.app.backend.features.product.services.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAll(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(branchId)));
    }

    @GetMapping("/tag/{tagCode}")
    public ResponseEntity<ApiResponse<ProductDto>> getByTagCode(@PathVariable String tagCode) {
        return ResponseEntity.ok(ApiResponse.success(productService.getByTagCode(tagCode)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<WarehouseSummaryDto>> getSummary(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.success(productService.getWarehouseSummary(branchId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> create(@Valid @RequestBody ProductDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Nhập kho sản phẩm mới thành công", productService.createProduct(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> update(@PathVariable Long id, @Valid @RequestBody ProductDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", productService.updateProduct(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }
}
