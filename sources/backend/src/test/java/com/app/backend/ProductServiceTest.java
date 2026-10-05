package com.app.backend;

import com.app.backend.common.entities.Product;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.branch.repositories.BranchRepository;
import com.app.backend.features.company.repositories.CompanyRepository;
import com.app.backend.features.product.dtos.ProductDto;
import com.app.backend.features.product.repositories.ProductRepository;
import com.app.backend.features.product.services.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private BranchRepository branchRepository;
    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("UT_PROD_001: Tính đúng trọng lượng vàng ròng = Tổng trọng lượng - Trọng lượng đá")
    void testPureGoldCalculation() {
        when(productRepository.existsByTagCode("V24K-TEST")).thenReturn(false);
        when(branchRepository.findByDeletedAtIsNull()).thenReturn(Collections.emptyList());
        when(productRepository.save(any(Product.class))).thenAnswer(i -> {
            Product p = i.getArgument(0);
            p.setId(10L);
            return p;
        });

        ProductDto dto = ProductDto.builder()
                .tagCode("V24K-TEST")
                .name("Nhẫn vàng 24K")
                .goldType("24K")
                .totalWeight(new BigDecimal("2.5000"))
                .stoneWeight(new BigDecimal("0.2000"))
                .laborCost(new BigDecimal("200000"))
                .stockQuantity(5)
                .build();

        ProductDto result = productService.createProduct(dto);

        assertNotNull(result);
        assertEquals(new BigDecimal("2.3000"), result.getPureGoldWeight());
    }

    @Test
    @DisplayName("UT_PROD_002: Báo lỗi khi trọng lượng đá vượt quá tổng trọng lượng")
    void testStoneWeightExceedsTotalWeight() {
        when(productRepository.existsByTagCode("V24K-ERR")).thenReturn(false);

        ProductDto dto = ProductDto.builder()
                .tagCode("V24K-ERR")
                .name("Nhẫn vàng lỗi")
                .goldType("24K")
                .totalWeight(new BigDecimal("2.0000"))
                .stoneWeight(new BigDecimal("2.5000")) // Stone > Total
                .laborCost(new BigDecimal("100000"))
                .stockQuantity(1)
                .build();

        AppException ex = assertThrows(AppException.class, () -> productService.createProduct(dto));
        assertEquals(ErrorCode.INVALID_GOLD_WEIGHT, ex.getErrorCode());
    }

    @Test
    @DisplayName("UT_PROD_003: Báo lỗi khi tạo mã tem sản phẩm đã tồn tại")
    void testDuplicateTagCode() {
        when(productRepository.existsByTagCode("TRUNG-MA")).thenReturn(true);

        ProductDto dto = ProductDto.builder()
                .tagCode("TRUNG-MA")
                .name("Sản phẩm trùng mã")
                .goldType("18K")
                .totalWeight(new BigDecimal("1.0000"))
                .laborCost(new BigDecimal("50000"))
                .stockQuantity(1)
                .build();

        AppException ex = assertThrows(AppException.class, () -> productService.createProduct(dto));
        assertEquals(ErrorCode.TAG_CODE_EXISTED, ex.getErrorCode());
    }
}
