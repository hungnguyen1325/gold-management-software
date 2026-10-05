package com.app.backend.features.sale.services;

import com.app.backend.common.entities.*;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.branch.repositories.BranchRepository;
import com.app.backend.features.cashbook.repositories.CashbookShiftRepository;
import com.app.backend.features.cashbook.repositories.CashTransactionRepository;
import com.app.backend.features.goldprice.repositories.GoldPriceRepository;
import com.app.backend.features.product.repositories.ProductRepository;
import com.app.backend.features.sale.dtos.SaleDto;
import com.app.backend.features.sale.repositories.SaleInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleInvoiceRepository saleInvoiceRepository;
    private final ProductRepository productRepository;
    private final GoldPriceRepository goldPriceRepository;
    private final BranchRepository branchRepository;
    private final CashbookShiftRepository shiftRepository;
    private final CashTransactionRepository cashTransactionRepository;

    @Transactional(readOnly = true)
    public List<SaleDto.InvoiceResponse> getAllInvoices(Long branchId) {
        List<SaleInvoice> list = (branchId != null)
                ? saleInvoiceRepository.findByBranchIdOrderByCreatedAtDesc(branchId)
                : saleInvoiceRepository.findAllByOrderByCreatedAtDesc();

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SaleDto.InvoiceResponse getByInvoiceCode(String code) {
        SaleInvoice inv = saleInvoiceRepository.findByInvoiceCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Không tìm thấy hóa đơn"));
        return mapToDto(inv);
    }

    @Transactional
    public SaleDto.InvoiceResponse createSaleInvoice(SaleDto.CreateRequest request) {
        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId()).orElse(null);
        }
        if (branch == null) {
            List<Branch> branches = branchRepository.findByDeletedAtIsNull();
            if (!branches.isEmpty()) branch = branches.get(0);
        }

        String invoiceCode = "HD-" + OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + (int) (Math.random() * 900 + 100);

        SaleInvoice invoice = new SaleInvoice();
        invoice.setInvoiceCode(invoiceCode);
        invoice.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : "Khách vãng lai");
        invoice.setCustomerPhone(request.getCustomerPhone());
        invoice.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
        invoice.setStatus("COMPLETED");
        invoice.setNotes(request.getNotes());
        invoice.setBranch(branch);
        invoice.setCompany(branch != null ? branch.getCompany() : null);
        invoice.setCreatedAt(OffsetDateTime.now());

        BigDecimal subTotal = BigDecimal.ZERO;
        BigDecimal totalWeightSum = BigDecimal.ZERO;
        BigDecimal totalPureGoldWeightSum = BigDecimal.ZERO;
        List<SaleInvoiceItem> items = new ArrayList<>();

        for (SaleDto.ItemRequest itemReq : request.getItems()) {
            Product product = null;
            if (itemReq.getProductId() != null) {
                product = productRepository.findById(itemReq.getProductId()).orElse(null);
            }
            if (product == null && itemReq.getTagCode() != null) {
                product = productRepository.findByTagCode(itemReq.getTagCode()).orElse(null);
            }
            if (product == null) {
                throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            }

            int reqQty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 1;
            if (product.getStockQuantity() < reqQty) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
                        "Sản phẩm " + product.getName() + " (" + product.getTagCode() + ") chỉ còn " + product.getStockQuantity() + " trong kho!");
            }

            // Find current gold price
            Optional<GoldPrice> priceOpt = goldPriceRepository.findByGoldType(product.getGoldType());
            BigDecimal rate = priceOpt.map(GoldPrice::getSellPrice).orElse(new BigDecimal("8500000"));

            // Calculate item price = (pureGoldWeight * rate) + laborCost
            BigDecimal goldValue = product.getPureGoldWeight().multiply(rate);
            BigDecimal singleItemPrice = goldValue.add(product.getLaborCost());
            BigDecimal lineTotal = singleItemPrice.multiply(BigDecimal.valueOf(reqQty));

            subTotal = subTotal.add(lineTotal);

            // Accumulate weights
            BigDecimal itemTotalWeight = (product.getTotalWeight() != null ? product.getTotalWeight() : BigDecimal.ZERO)
                    .multiply(BigDecimal.valueOf(reqQty));
            BigDecimal itemPureGoldWeight = (product.getPureGoldWeight() != null ? product.getPureGoldWeight() : BigDecimal.ZERO)
                    .multiply(BigDecimal.valueOf(reqQty));
            totalWeightSum = totalWeightSum.add(itemTotalWeight);
            totalPureGoldWeightSum = totalPureGoldWeightSum.add(itemPureGoldWeight);

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - reqQty);
            int threshold = product.getLowStockThreshold() != null ? product.getLowStockThreshold() : 3;
            product.setStatus(product.getStockQuantity() <= threshold
                    ? (product.getStockQuantity() == 0 ? "OUT_OF_STOCK" : "LOW_STOCK")
                    : "AVAILABLE");
            productRepository.save(product);

            SaleInvoiceItem lineItem = new SaleInvoiceItem();
            lineItem.setSaleInvoice(invoice);
            lineItem.setProduct(product);
            lineItem.setQuantity(reqQty);
            lineItem.setTotalWeight(product.getTotalWeight());
            lineItem.setStoneWeight(product.getStoneWeight() != null ? product.getStoneWeight() : BigDecimal.ZERO);
            lineItem.setPureGoldWeight(product.getPureGoldWeight());
            lineItem.setGoldPriceRate(rate);
            lineItem.setLaborCost(product.getLaborCost());
            lineItem.setItemTotal(lineTotal);
            items.add(lineItem);
        }

        BigDecimal discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal total = subTotal.subtract(discount);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        BigDecimal paid = request.getPaidAmount() != null ? request.getPaidAmount() : total;
        if (paid.compareTo(total) < 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Số tiền khách trả (" + paid + ") nhỏ hơn tổng hóa đơn (" + total + ")");
        }
        BigDecimal change = paid.subtract(total);

        invoice.setSubTotal(subTotal);
        invoice.setDiscountAmount(discount);
        invoice.setTotalAmount(total);
        invoice.setPaidAmount(paid);
        invoice.setChangeAmount(change);
        invoice.setTotalWeight(totalWeightSum);
        invoice.setTotalPureGoldWeight(totalPureGoldWeightSum);
        invoice.setItems(items);

        SaleInvoice saved = saleInvoiceRepository.save(invoice);

        // Auto record into active cashbook shift if CASH payment
        if ("CASH".equalsIgnoreCase(invoice.getPaymentMethod())) {
            final BigDecimal finalInvoiceTotal = total;
            Optional<CashbookShift> openShift = shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN");
            openShift.ifPresent(shift -> {
                CashTransaction ct = new CashTransaction();
                ct.setVoucherCode("PT-" + invoice.getInvoiceCode());
                ct.setType("RECEIPT");
                ct.setCategory("Bán hàng trang sức");
                ct.setAmount(finalInvoiceTotal);
                ct.setPaymentMethod("CASH");
                ct.setReferenceCode(invoice.getInvoiceCode());
                ct.setPayerReceiver(invoice.getCustomerName());
                ct.setNotes("Thu tiền bán hàng hóa đơn " + invoice.getInvoiceCode());
                ct.setShift(shift);
                ct.setBranch(shift.getBranch());
                ct.setCreatedAt(OffsetDateTime.now());
                cashTransactionRepository.save(ct);

                // Update shift balance
                shift.setTotalReceipts(shift.getTotalReceipts().add(finalInvoiceTotal));
                shift.setSystemBalance(shift.getInitialBalance().add(shift.getTotalReceipts()).subtract(shift.getTotalExpenses()));
                shiftRepository.save(shift);
            });
        }

        return mapToDto(saved);
    }

    private SaleDto.InvoiceResponse mapToDto(SaleInvoice inv) {
        List<SaleDto.ItemResponse> itemResponses = inv.getItems().stream().map(it -> {
            BigDecimal tw = it.getTotalWeight() != null ? it.getTotalWeight()
                    : (it.getProduct() != null ? it.getProduct().getTotalWeight() : BigDecimal.ZERO);
            BigDecimal sw = it.getStoneWeight() != null ? it.getStoneWeight()
                    : (it.getProduct() != null ? it.getProduct().getStoneWeight() : BigDecimal.ZERO);
            BigDecimal pw = it.getPureGoldWeight() != null ? it.getPureGoldWeight()
                    : (it.getProduct() != null ? it.getProduct().getPureGoldWeight() : BigDecimal.ZERO);

            return SaleDto.ItemResponse.builder()
                    .id(it.getId())
                    .productId(it.getProduct() != null ? it.getProduct().getId() : null)
                    .tagCode(it.getProduct() != null ? it.getProduct().getTagCode() : "")
                    .productName(it.getProduct() != null ? it.getProduct().getName() : "")
                    .goldType(it.getProduct() != null ? it.getProduct().getGoldType() : "")
                    .totalWeight(tw)
                    .stoneWeight(sw)
                    .pureGoldWeight(pw)
                    .quantity(it.getQuantity())
                    .goldPriceRate(it.getGoldPriceRate())
                    .laborCost(it.getLaborCost())
                    .itemTotal(it.getItemTotal())
                    .build();
        }).collect(Collectors.toList());

        BigDecimal invTotalWeight = inv.getTotalWeight();
        if (invTotalWeight == null || invTotalWeight.compareTo(BigDecimal.ZERO) == 0) {
            invTotalWeight = itemResponses.stream()
                    .map(it -> (it.getTotalWeight() != null ? it.getTotalWeight() : BigDecimal.ZERO)
                            .multiply(BigDecimal.valueOf(it.getQuantity() != null ? it.getQuantity() : 1)))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal invPureGoldWeight = inv.getTotalPureGoldWeight();
        if (invPureGoldWeight == null || invPureGoldWeight.compareTo(BigDecimal.ZERO) == 0) {
            invPureGoldWeight = itemResponses.stream()
                    .map(it -> (it.getPureGoldWeight() != null ? it.getPureGoldWeight() : BigDecimal.ZERO)
                            .multiply(BigDecimal.valueOf(it.getQuantity() != null ? it.getQuantity() : 1)))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return SaleDto.InvoiceResponse.builder()
                .id(inv.getId())
                .invoiceCode(inv.getInvoiceCode())
                .customerName(inv.getCustomerName())
                .customerPhone(inv.getCustomerPhone())
                .totalWeight(invTotalWeight)
                .totalPureGoldWeight(invPureGoldWeight)
                .subTotal(inv.getSubTotal())
                .discountAmount(inv.getDiscountAmount())
                .taxAmount(inv.getTaxAmount())
                .totalAmount(inv.getTotalAmount())
                .paidAmount(inv.getPaidAmount())
                .changeAmount(inv.getChangeAmount())
                .paymentMethod(inv.getPaymentMethod())
                .status(inv.getStatus())
                .notes(inv.getNotes())
                .branchId(inv.getBranch() != null ? inv.getBranch().getId() : null)
                .branchName(inv.getBranch() != null ? inv.getBranch().getName() : "")
                .items(itemResponses)
                .createdAt(inv.getCreatedAt())
                .build();
    }
}
