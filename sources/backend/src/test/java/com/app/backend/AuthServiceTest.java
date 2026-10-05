package com.app.backend;

import com.app.backend.common.entities.Account;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.configs.JwtService;
import com.app.backend.features.auth.dtos.LoginDto;
import com.app.backend.features.auth.dtos.LoginResponse;
import com.app.backend.features.auth.repositories.AccountRepository;
import com.app.backend.features.auth.repositories.RoleRepository;
import com.app.backend.features.auth.services.AuthService;
import com.app.backend.features.branch.repositories.BranchRepository;
import com.app.backend.features.company.repositories.CompanyRepository;
import com.app.backend.features.employee.repositories.EmployeeRepository;
import com.app.backend.features.goldprice.repositories.GoldPriceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private AccountRepository accountRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private BranchRepository branchRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private GoldPriceRepository goldPriceRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private Account mockAccount;

    @BeforeEach
    void setUp() {
        mockAccount = new Account();
        mockAccount.setId(1L);
        mockAccount.setUsername("admin");
        mockAccount.setPassword("encodedPassword");
    }

    @Test
    @DisplayName("UT_AUTH_001: Đăng nhập thành công với tài khoản và mật khẩu hợp lệ")
    void testLoginSuccess() {
        when(accountRepository.findByUsername("admin")).thenReturn(Optional.of(mockAccount));
        when(passwordEncoder.matches("admin123", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken(eq("admin"), any())).thenReturn("mock.jwt.token");
        when(employeeRepository.findByAccountId(1L)).thenReturn(Optional.empty());

        LoginDto loginDto = new LoginDto("admin", "admin123");
        LoginResponse response = authService.login(loginDto);

        assertNotNull(response);
        assertEquals("admin", response.getUsername());
        assertEquals("mock.jwt.token", response.getToken());
        verify(accountRepository, times(1)).findByUsername("admin");
    }

    @Test
    @DisplayName("UT_AUTH_002: Đăng nhập thất bại khi sai mật khẩu")
    void testLoginWrongPassword() {
        when(accountRepository.findByUsername("admin")).thenReturn(Optional.of(mockAccount));
        when(passwordEncoder.matches("wrongPass", "encodedPassword")).thenReturn(false);

        LoginDto loginDto = new LoginDto("admin", "wrongPass");
        AppException ex = assertThrows(AppException.class, () -> authService.login(loginDto));

        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
    }

    @Test
    @DisplayName("UT_AUTH_003: Đăng nhập thất bại khi tài khoản không tồn tại")
    void testLoginUserNotFound() {
        when(accountRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        LoginDto loginDto = new LoginDto("unknown", "password");
        AppException ex = assertThrows(AppException.class, () -> authService.login(loginDto));

        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
    }

    @Test
    @DisplayName("UT_AUTH_004: Đăng nhập thất bại khi username rỗng")
    void testLoginEmptyUsername() {
        LoginDto loginDto = new LoginDto("", "password");
        AppException ex = assertThrows(AppException.class, () -> authService.login(loginDto));

        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
    }
}
