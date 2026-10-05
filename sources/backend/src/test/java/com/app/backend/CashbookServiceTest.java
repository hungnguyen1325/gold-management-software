package com.app.backend;

import com.app.backend.common.entities.CashbookShift;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.branch.repositories.BranchRepository;
import com.app.backend.features.cashbook.dtos.CashbookDto;
import com.app.backend.features.cashbook.repositories.CashTransactionRepository;
import com.app.backend.features.cashbook.repositories.CashbookShiftRepository;
import com.app.backend.features.cashbook.services.CashbookService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CashbookServiceTest {

    @Mock
    private CashbookShiftRepository shiftRepository;
    @Mock
    private CashTransactionRepository transactionRepository;
    @Mock
    private BranchRepository branchRepository;

    @InjectMocks
    private CashbookService cashbookService;

    @Test
    @DisplayName("UT_CASH_001: Mở ca làm việc mới và gán số dư đầu ca")
    void testOpenShift() {
        when(shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN")).thenReturn(Optional.empty());
        when(branchRepository.findByDeletedAtIsNull()).thenReturn(Collections.emptyList());
        when(shiftRepository.save(any(CashbookShift.class))).thenAnswer(i -> {
            CashbookShift s = i.getArgument(0);
            s.setId(1L);
            return s;
        });

        CashbookDto.OpenShiftRequest req = new CashbookDto.OpenShiftRequest(new BigDecimal("15000000"), "Ca 1", null);
        CashbookDto.ShiftResponse response = cashbookService.openShift(req);

        assertNotNull(response);
        assertEquals(new BigDecimal("15000000"), response.getInitialBalance());
        assertEquals(new BigDecimal("15000000"), response.getSystemBalance());
        assertEquals("OPEN", response.getStatus());
    }

    @Test
    @DisplayName("UT_CASH_002: Kết ca và tính đúng chênh lệch = Thực tế - Sổ sách")
    void testCloseShift() {
        CashbookShift shift = new CashbookShift();
        shift.setId(1L);
        shift.setStatus("OPEN");
        shift.setSystemBalance(new BigDecimal("25000000")); // Sổ sách: 25 triệu

        when(shiftRepository.findById(1L)).thenReturn(Optional.of(shift));
        when(shiftRepository.save(any(CashbookShift.class))).thenAnswer(i -> i.getArgument(0));

        // Kiểm đếm thực tế: 25.5 triệu (+500k thừa quỹ)
        CashbookDto.CloseShiftRequest req = new CashbookDto.CloseShiftRequest(new BigDecimal("25500000"), "Thừa 500k");
        CashbookDto.ShiftResponse response = cashbookService.closeShift(1L, req);

        assertNotNull(response);
        assertEquals("CLOSED", response.getStatus());
        assertEquals(new BigDecimal("500000"), response.getDifference());
    }

    @Test
    @DisplayName("UT_CASH_003: Chặn chi tiền mặt khi số dư quỹ không đủ (Chống chi âm)")
    void testExpenseExceedsBalance() {
        CashbookShift shift = new CashbookShift();
        shift.setStatus("OPEN");
        shift.setSystemBalance(new BigDecimal("3000000")); // Quỹ chỉ có 3 triệu

        when(shiftRepository.findFirstByStatusOrderByOpenedAtDesc("OPEN")).thenReturn(Optional.of(shift));

        // Cố gắng chi 5 triệu
        CashbookDto.TransactionRequest req = CashbookDto.TransactionRequest.builder()
                .type("EXPENSE")
                .amount(new BigDecimal("5000000"))
                .category("Chi phí sửa chữa")
                .build();

        AppException ex = assertThrows(AppException.class, () -> cashbookService.createTransaction(req));
        assertEquals(ErrorCode.INSUFFICIENT_CASH_BALANCE, ex.getErrorCode());
    }
}
