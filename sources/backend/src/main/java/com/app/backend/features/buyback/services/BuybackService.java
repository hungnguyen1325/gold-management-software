package com.app.backend.features.buyback.services;

import com.app.backend.common.entities.*;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.branch.repositories.BranchRepository;
import com.app.backend.features.buyback.dtos.BuybackDto;
import com.app.backend.features.buyback.repositories.BuybackTransactionRepository;
import com.app.backend.features.cashbook.repositories.CashbookShiftRepository;
import com.app.backend.features.cashbook.repositories.CashTransactionRepository;
import com.app.backend.features.goldprice.repositories.GoldPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BuybackService {

    private final BuybackTransactionRepository buybackRepository;
    private final GoldPriceRepository goldPriceRepository;
    private final BranchRepository branchRepository;
    private final CashbookShiftRepository shiftRepository;
    private final CashTransactionRepository cashTransactionRepository;

    @Transactional(readOnly = true)
    public List<BuybackDto> getAllTransactions(Long branchId) {
        List<BuybackTransaction> list = (branchId != null)
                ? buybackRepository.findByBranchIdOrderByCreatedAtDesc(branchId)
                : buybackRepository.findAllByOrderByCreatedAtDesc();

        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public BuybackDto createTransaction(BuybackDto dto) {
        if (dto.getWeight() == null || dto.getWeight().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Trọng lượng vàng mua lại phải lớn hơn 0");
        }

        Branch branch = null;
        if (dto.getBranchId() != null) {
            branch = branchRepository.findById(dto.getBranchId()).orElse(null);
        }
        if (branch == null) {
            List<Branch> branches = branchRepository.findByDeletedAtIsNull();
            if (!branches.isEmpty()) branch = branches.get(0);
        }

        // Get buy price rate
        BigDecimal rate = dto.getUnitPrice();
        if (rate == null || rate.compareTo(BigDecimal.ZERO) <= 0) {
            Optional<GoldPrice> gpOpt = goldPriceRepository.findByGoldType(dto.getGoldType());
            rate = gpOpt.map(GoldPrice::getBuyPrice).orElse(new BigDecimal("8400000"));
        }

        BigDecimal grossAmount = dto.getWeight().multiply(rate);
        BigDecimal deduction = dto.getDeductionAmount() != null ? dto.getDeductionAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = grossAmount.subtract(deduction);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) totalAmount = BigDecimal.ZERO;

        String method = dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "CASH";

        // Cashbook balance validation if paying with cash
        if ("CASH".equalsIgnoreCase(method)) {
            Optional<CashbookShift> openShiftOpt = shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN");
            if (openShiftOpt.isPresent()) {
                CashbookShift shift = openShiftOpt.get();
                if (shift.getSystemBalance().compareTo(totalAmount) < 0) {
                    throw new AppException(ErrorCode.INSUFFICIENT_CASH_BALANCE,
                            "Quỹ tiền mặt chỉ còn " + shift.getSystemBalance() + " đ, không đủ để chi trả " + totalAmount + " đ!");
                }
            }
        }

        String code = "PM-" + OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + (int) (Math.random() * 900 + 100);

        BuybackTransaction tx = new BuybackTransaction();
        tx.setTransactionCode(code);
        tx.setCustomerName(dto.getCustomerName() != null ? dto.getCustomerName() : "Khách bán lại");
        tx.setCustomerPhone(dto.getCustomerPhone());
        tx.setGoldType(dto.getGoldType());
        tx.setWeight(dto.getWeight());
        tx.setUnitPrice(rate);
        tx.setDeductionAmount(deduction);
        tx.setTotalAmount(totalAmount);
        tx.setPaymentMethod(method);
        tx.setStatus("COMPLETED");
        tx.setNotes(dto.getNotes());
        tx.setBranch(branch);
        tx.setCompany(branch != null ? branch.getCompany() : null);
        tx.setCreatedAt(OffsetDateTime.now());

        BuybackTransaction saved = buybackRepository.save(tx);

        // Auto record cash expense if cash payment
        if ("CASH".equalsIgnoreCase(method)) {
            final BigDecimal finalTotal = totalAmount;
            shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN").ifPresent(shift -> {
                CashTransaction ct = new CashTransaction();
                ct.setVoucherCode("PC-" + tx.getTransactionCode());
                ct.setType("EXPENSE");
                ct.setCategory("Mua lại vàng từ khách");
                ct.setAmount(finalTotal);
                ct.setPaymentMethod("CASH");
                ct.setReferenceCode(tx.getTransactionCode());
                ct.setPayerReceiver(tx.getCustomerName());
                ct.setNotes("Chi tiền mua lại vàng theo phiếu " + tx.getTransactionCode());
                ct.setShift(shift);
                ct.setBranch(shift.getBranch());
                ct.setCreatedAt(OffsetDateTime.now());
                cashTransactionRepository.save(ct);

                shift.setTotalExpenses(shift.getTotalExpenses().add(finalTotal));
                shift.setSystemBalance(shift.getInitialBalance().add(shift.getTotalReceipts()).subtract(shift.getTotalExpenses()));
                shiftRepository.save(shift);
            });
        }

        return mapToDto(saved);
    }

    private BuybackDto mapToDto(BuybackTransaction tx) {
        return BuybackDto.builder()
                .id(tx.getId())
                .transactionCode(tx.getTransactionCode())
                .customerName(tx.getCustomerName())
                .customerPhone(tx.getCustomerPhone())
                .goldType(tx.getGoldType())
                .weight(tx.getWeight())
                .unitPrice(tx.getUnitPrice())
                .deductionAmount(tx.getDeductionAmount())
                .totalAmount(tx.getTotalAmount())
                .paymentMethod(tx.getPaymentMethod())
                .status(tx.getStatus())
                .notes(tx.getNotes())
                .branchId(tx.getBranch() != null ? tx.getBranch().getId() : null)
                .branchName(tx.getBranch() != null ? tx.getBranch().getName() : "")
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
