package com.app.backend.features.cashbook.services;

import com.app.backend.common.entities.Branch;
import com.app.backend.common.entities.CashbookShift;
import com.app.backend.common.entities.CashTransaction;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.branch.repositories.BranchRepository;
import com.app.backend.features.cashbook.dtos.CashbookDto;
import com.app.backend.features.cashbook.repositories.CashbookShiftRepository;
import com.app.backend.features.cashbook.repositories.CashTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CashbookService {

    private final CashbookShiftRepository shiftRepository;
    private final CashTransactionRepository transactionRepository;
    private final BranchRepository branchRepository;

    @Transactional(readOnly = true)
    public CashbookDto.ShiftResponse getActiveShift(Long branchId) {
        Optional<CashbookShift> shiftOpt = shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN");
        if (shiftOpt.isEmpty()) {
            return null;
        }
        return mapShiftToDto(shiftOpt.get());
    }

    @Transactional(readOnly = true)
    public List<CashbookDto.ShiftResponse> getAllShifts() {
        return shiftRepository.findAllByOrderByOpenedAtDesc().stream()
                .map(this::mapShiftToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CashbookDto.ShiftResponse openShift(CashbookDto.OpenShiftRequest request) {
        Optional<CashbookShift> existing = shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN");
        if (existing.isPresent()) {
            throw new AppException(ErrorCode.SHIFT_ALREADY_OPEN);
        }

        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId()).orElse(null);
        }
        if (branch == null) {
            List<Branch> branches = branchRepository.findByDeletedAtIsNull();
            if (!branches.isEmpty()) branch = branches.get(0);
        }

        String shiftCode = "CA-" + OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-01";

        CashbookShift shift = new CashbookShift();
        shift.setShiftCode(shiftCode);
        shift.setShiftName(request.getShiftName() != null ? request.getShiftName() : "Ca 1 (Sáng)");
        shift.setInitialBalance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO);
        shift.setTotalReceipts(BigDecimal.ZERO);
        shift.setTotalExpenses(BigDecimal.ZERO);
        shift.setSystemBalance(shift.getInitialBalance());
        shift.setStatus("OPEN");
        shift.setBranch(branch);
        shift.setOpenedAt(OffsetDateTime.now());

        CashbookShift saved = shiftRepository.save(shift);
        return mapShiftToDto(saved);
    }

    @Transactional
    public CashbookDto.ShiftResponse closeShift(Long shiftId, CashbookDto.CloseShiftRequest request) {
        CashbookShift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Không tìm thấy ca làm việc"));

        if (!"OPEN".equals(shift.getStatus())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Ca làm việc này đã được kết thúc trước đó");
        }

        BigDecimal counted = request.getCountedCash() != null ? request.getCountedCash() : BigDecimal.ZERO;
        BigDecimal diff = counted.subtract(shift.getSystemBalance());

        shift.setCountedCash(counted);
        shift.setDifference(diff);
        shift.setStatus("CLOSED");
        shift.setClosedAt(OffsetDateTime.now());

        CashbookShift saved = shiftRepository.save(shift);
        return mapShiftToDto(saved);
    }

    @Transactional
    public CashbookDto.TransactionResponse createTransaction(CashbookDto.TransactionRequest request) {
        CashbookShift shift = shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN")
                .orElseThrow(() -> new AppException(ErrorCode.SHIFT_NOT_OPEN));

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Số tiền giao dịch phải lớn hơn 0");
        }

        boolean isExpense = "EXPENSE".equalsIgnoreCase(request.getType());
        if (isExpense && shift.getSystemBalance().compareTo(request.getAmount()) < 0) {
            throw new AppException(ErrorCode.INSUFFICIENT_CASH_BALANCE);
        }

        String prefix = isExpense ? "PC-" : "PT-";
        String code = prefix + System.currentTimeMillis();

        CashTransaction tx = new CashTransaction();
        tx.setVoucherCode(code);
        tx.setType(isExpense ? "EXPENSE" : "RECEIPT");
        tx.setCategory(request.getCategory() != null ? request.getCategory() : (isExpense ? "Chi phí khác" : "Thu khác"));
        tx.setAmount(request.getAmount());
        tx.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH");
        tx.setPayerReceiver(request.getPayerReceiver());
        tx.setNotes(request.getNotes());
        tx.setShift(shift);
        tx.setBranch(shift.getBranch());
        tx.setCreatedAt(OffsetDateTime.now());

        CashTransaction saved = transactionRepository.save(tx);

        if (isExpense) {
            shift.setTotalExpenses(shift.getTotalExpenses().add(request.getAmount()));
        } else {
            shift.setTotalReceipts(shift.getTotalReceipts().add(request.getAmount()));
        }
        shift.setSystemBalance(shift.getInitialBalance().add(shift.getTotalReceipts()).subtract(shift.getTotalExpenses()));
        shiftRepository.save(shift);

        return mapTxToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<CashbookDto.TransactionResponse> getTransactions(Long shiftId) {
        List<CashTransaction> list = (shiftId != null)
                ? transactionRepository.findByShiftIdOrderByCreatedAtDesc(shiftId)
                : transactionRepository.findAllByOrderByCreatedAtDesc();

        return list.stream().map(this::mapTxToDto).collect(Collectors.toList());
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialShift() {
        if (shiftRepository.count() == 0) {
            List<Branch> branches = branchRepository.findAll();
            Branch branch = branches.isEmpty() ? null : branches.get(0);

            CashbookShift shift = new CashbookShift();
            shift.setShiftCode("CA-" + OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-01");
            shift.setShiftName("Ca Sáng (08:00 - 15:00)");
            shift.setInitialBalance(new BigDecimal("20000000")); // 20,000,000 VND
            shift.setTotalReceipts(BigDecimal.ZERO);
            shift.setTotalExpenses(BigDecimal.ZERO);
            shift.setSystemBalance(new BigDecimal("20000000"));
            shift.setStatus("OPEN");
            shift.setBranch(branch);
            shift.setOpenedAt(OffsetDateTime.now());
            shiftRepository.save(shift);

            log.info("Initialized default active Cashbook shift with 20,000,000 VND initial balance.");
        }
    }

    private CashbookDto.ShiftResponse mapShiftToDto(CashbookShift s) {
        List<CashbookDto.TransactionResponse> txList = transactionRepository.findByShiftIdOrderByCreatedAtDesc(s.getId())
                .stream().map(this::mapTxToDto).collect(Collectors.toList());

        return CashbookDto.ShiftResponse.builder()
                .id(s.getId())
                .shiftCode(s.getShiftCode())
                .shiftName(s.getShiftName())
                .initialBalance(s.getInitialBalance())
                .totalReceipts(s.getTotalReceipts())
                .totalExpenses(s.getTotalExpenses())
                .systemBalance(s.getSystemBalance())
                .countedCash(s.getCountedCash())
                .difference(s.getDifference())
                .status(s.getStatus())
                .branchId(s.getBranch() != null ? s.getBranch().getId() : null)
                .branchName(s.getBranch() != null ? s.getBranch().getName() : "")
                .openedAt(s.getOpenedAt())
                .closedAt(s.getClosedAt())
                .transactions(txList)
                .build();
    }

    private CashbookDto.TransactionResponse mapTxToDto(CashTransaction tx) {
        return CashbookDto.TransactionResponse.builder()
                .id(tx.getId())
                .voucherCode(tx.getVoucherCode())
                .type(tx.getType())
                .category(tx.getCategory())
                .amount(tx.getAmount())
                .paymentMethod(tx.getPaymentMethod())
                .referenceCode(tx.getReferenceCode())
                .payerReceiver(tx.getPayerReceiver())
                .notes(tx.getNotes())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
