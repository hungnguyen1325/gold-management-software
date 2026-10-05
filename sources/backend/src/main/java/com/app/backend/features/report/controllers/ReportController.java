package com.app.backend.features.report.controllers;

import com.app.backend.common.response.ApiResponse;
import com.app.backend.features.report.dtos.DashboardStatsDto;
import com.app.backend.features.report.services.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboard(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getDashboardStats(branchId)));
    }
}
