package com.app.backend.features.product.services;

import com.app.backend.common.entities.Branch;
import com.app.backend.common.entities.Company;
import com.app.backend.common.entities.Product;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.branch.repositories.BranchRepository;
import com.app.backend.features.company.repositories.CompanyRepository;
import com.app.backend.features.product.dtos.ProductDto;
import com.app.backend.features.product.dtos.WarehouseSummaryDto;
import com.app.backend.features.product.repositories.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final BranchRepository branchRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<ProductDto> getAllProducts(Long branchId) {
        List<Product> products = (branchId != null)
                ? productRepository.findByBranchIdAndDeletedAtIsNull(branchId)
                : productRepository.findByDeletedAtIsNull();

        return products.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDto getByTagCode(String tagCode) {
        Product p = productRepository.findByTagCode(tagCode)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return mapToDto(p);
    }

    @Transactional
    public ProductDto createProduct(ProductDto dto) {
        if (productRepository.existsByTagCode(dto.getTagCode())) {
            throw new AppException(ErrorCode.TAG_CODE_EXISTED);
        }

        BigDecimal stone = dto.getStoneWeight() != null ? dto.getStoneWeight() : BigDecimal.ZERO;
        if (stone.compareTo(dto.getTotalWeight()) > 0) {
            throw new AppException(ErrorCode.INVALID_GOLD_WEIGHT);
        }

        if (dto.getTotalWeight().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Trọng lượng tổng phải lớn hơn 0");
        }

        if (dto.getLaborCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Tiền công không được nhỏ hơn 0");
        }

        if (dto.getStockQuantity() < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Số lượng tồn kho không được âm");
        }

        BigDecimal pure = dto.getTotalWeight().subtract(stone);

        Branch branch = null;
        if (dto.getBranchId() != null) {
            branch = branchRepository.findById(dto.getBranchId())
                    .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOT_FOUND));
        } else {
            List<Branch> branches = branchRepository.findByDeletedAtIsNull();
            if (!branches.isEmpty()) branch = branches.get(0);
        }

        Product p = new Product();
        p.setTagCode(dto.getTagCode().trim().toUpperCase());
        p.setName(dto.getName());
        p.setCategory(dto.getCategory() != null ? dto.getCategory() : "Trang sức");
        p.setGoldType(dto.getGoldType());
        p.setTotalWeight(dto.getTotalWeight());
        p.setStoneWeight(stone);
        p.setPureGoldWeight(pure);
        p.setLaborCost(dto.getLaborCost());
        p.setLocationCabinet(dto.getLocationCabinet() != null ? dto.getLocationCabinet() : "Tủ 01");
        p.setStockQuantity(dto.getStockQuantity());
        int threshold = dto.getLowStockThreshold() != null ? dto.getLowStockThreshold() : 3;
        p.setLowStockThreshold(threshold);
        p.setStatus(p.getStockQuantity() <= threshold ? (p.getStockQuantity() == 0 ? "OUT_OF_STOCK" : "LOW_STOCK") : "AVAILABLE");
        p.setBranch(branch);
        p.setCompany(branch != null ? branch.getCompany() : null);
        p.setCreatedAt(OffsetDateTime.now());

        Product saved = productRepository.save(p);
        return mapToDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (!p.getTagCode().equalsIgnoreCase(dto.getTagCode()) && productRepository.existsByTagCode(dto.getTagCode())) {
            throw new AppException(ErrorCode.TAG_CODE_EXISTED);
        }

        BigDecimal stone = dto.getStoneWeight() != null ? dto.getStoneWeight() : BigDecimal.ZERO;
        if (stone.compareTo(dto.getTotalWeight()) > 0) {
            throw new AppException(ErrorCode.INVALID_GOLD_WEIGHT);
        }

        p.setName(dto.getName());
        p.setCategory(dto.getCategory());
        p.setGoldType(dto.getGoldType());
        p.setTotalWeight(dto.getTotalWeight());
        p.setStoneWeight(stone);
        p.setPureGoldWeight(dto.getTotalWeight().subtract(stone));
        p.setLaborCost(dto.getLaborCost());
        p.setLocationCabinet(dto.getLocationCabinet());
        p.setStockQuantity(dto.getStockQuantity());
        int threshold = dto.getLowStockThreshold() != null ? dto.getLowStockThreshold() : 3;
        p.setLowStockThreshold(threshold);
        p.setStatus(p.getStockQuantity() <= threshold ? (p.getStockQuantity() == 0 ? "OUT_OF_STOCK" : "LOW_STOCK") : "AVAILABLE");
        p.setUpdatedAt(OffsetDateTime.now());

        Product updated = productRepository.save(p);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        p.setDeletedAt(OffsetDateTime.now());
        productRepository.save(p);
    }

    @Transactional(readOnly = true)
    public WarehouseSummaryDto getWarehouseSummary(Long branchId) {
        long totalDesigns = productRepository.countTotalProducts();
        long totalPieces = productRepository.countTotalJewelryPieces();
        BigDecimal totalGold = productRepository.sumTotalPureGoldWeight();
        long lowStock = productRepository.findByStockQuantityLessThanEqualAndDeletedAtIsNull(3).size();

        return WarehouseSummaryDto.builder()
                .totalDesigns(totalDesigns)
                .totalJewelryPieces(totalPieces)
                .totalPureGoldWeight(totalGold != null ? totalGold : BigDecimal.ZERO)
                .lowStockCount(lowStock)
                .build();
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialProducts() {
        if (productRepository.count() == 0) {
            List<Branch> branches = branchRepository.findAll();
            Branch branch = branches.isEmpty() ? null : branches.get(0);
            Company company = branch != null ? branch.getCompany() : null;

            List<Product> initialProducts = List.of(
                    createSample("V24K-N01", "Nhẫn tròn trơn 24K 1 chỉ", "Nhẫn", "24K", new BigDecimal("1.0000"), BigDecimal.ZERO, new BigDecimal("150000"), "Tủ 01", 12, branch, company),
                    createSample("V24K-N02", "Nhẫn tròn trơn 24K 2 chỉ", "Nhẫn", "24K", new BigDecimal("2.0000"), BigDecimal.ZERO, new BigDecimal("200000"), "Tủ 01", 8, branch, company),
                    createSample("SJC-01", "Vàng miếng SJC 1 lượng", "Vàng miếng", "9999", new BigDecimal("10.0000"), BigDecimal.ZERO, new BigDecimal("0"), "Két sắt", 5, branch, company),
                    createSample("DC18K-001", "Dây chuyền vàng Ý 18K hoa văn", "Dây chuyền", "18K", new BigDecimal("3.2000"), new BigDecimal("0.2000"), new BigDecimal("750000"), "Tủ 02", 4, branch, company),
                    createSample("LT18K-001", "Lắc tay nữ kim tiền 18K", "Lắc tay", "18K", new BigDecimal("2.5000"), BigDecimal.ZERO, new BigDecimal("600000"), "Tủ 02", 2, branch, company), // Low stock
                    createSample("BT14K-001", "Bông tai đính đá phong thủy 14K", "Bông tai", "14K", new BigDecimal("1.2000"), new BigDecimal("0.3000"), new BigDecimal("450000"), "Tủ 03", 1, branch, company) // Low stock
            );
            productRepository.saveAll(initialProducts);
            log.info("Seeded 6 sample jewelry products into inventory.");
        }
    }

    private Product createSample(String tagCode, String name, String category, String goldType, BigDecimal totalWeight, BigDecimal stoneWeight, BigDecimal laborCost, String cabinet, int qty, Branch b, Company c) {
        Product p = new Product();
        p.setTagCode(tagCode);
        p.setName(name);
        p.setCategory(category);
        p.setGoldType(goldType);
        p.setTotalWeight(totalWeight);
        p.setStoneWeight(stoneWeight);
        p.setPureGoldWeight(totalWeight.subtract(stoneWeight));
        p.setLaborCost(laborCost);
        p.setLocationCabinet(cabinet);
        p.setStockQuantity(qty);
        p.setLowStockThreshold(3);
        p.setStatus(qty <= 3 ? (qty == 0 ? "OUT_OF_STOCK" : "LOW_STOCK") : "AVAILABLE");
        p.setBranch(b);
        p.setCompany(c);
        p.setCreatedAt(OffsetDateTime.now());
        return p;
    }

    private ProductDto mapToDto(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .tagCode(p.getTagCode())
                .name(p.getName())
                .category(p.getCategory())
                .goldType(p.getGoldType())
                .totalWeight(p.getTotalWeight())
                .stoneWeight(p.getStoneWeight())
                .pureGoldWeight(p.getPureGoldWeight())
                .laborCost(p.getLaborCost())
                .locationCabinet(p.getLocationCabinet())
                .stockQuantity(p.getStockQuantity())
                .lowStockThreshold(p.getLowStockThreshold())
                .status(p.getStatus())
                .branchId(p.getBranch() != null ? p.getBranch().getId() : null)
                .branchName(p.getBranch() != null ? p.getBranch().getName() : "")
                .createdAt(p.getCreatedAt())
                .build();
    }
}
