package com.app.backend.features.auth.controllers;

import com.app.backend.common.response.ApiResponse;
import com.app.backend.features.auth.dtos.LoginDto;
import com.app.backend.features.auth.dtos.LoginResponse;
import com.app.backend.features.auth.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginDto loginDto) {
        LoginResponse response = authService.login(loginDto);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/seed-init")
    public ResponseEntity<ApiResponse<String>> reseed() {
        authService.initSeedData();
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo dữ liệu mẫu thành công", "SUCCESS"));
    }
}
