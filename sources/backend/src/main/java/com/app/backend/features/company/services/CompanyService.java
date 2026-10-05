package com.app.backend.features.company.services;

import com.app.backend.common.entities.Company;
import com.app.backend.common.exceptions.AppException;
import com.app.backend.common.exceptions.ErrorCode;
import com.app.backend.features.company.dtos.CompanyDto;
import com.app.backend.features.company.repositories.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public List<CompanyDto> getAllCompanies() {
        return companyRepository.findByDeletedAtIsNull().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDto getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND));
        return mapToDto(company);
    }

    @Transactional
    public CompanyDto createCompany(CompanyDto dto) {
        if (companyRepository.existsByTaxCode(dto.getTaxCode())) {
            throw new AppException(ErrorCode.TAX_CODE_EXISTED);
        }

        Company company = new Company();
        company.setName(dto.getName());
        company.setTaxCode(dto.getTaxCode());
        company.setAddress(dto.getAddress());
        company.setPhone(dto.getPhone());
        company.setEmail(dto.getEmail());
        company.setCreatedAt(OffsetDateTime.now());

        Company saved = companyRepository.save(company);
        return mapToDto(saved);
    }

    @Transactional
    public CompanyDto updateCompany(Long id, CompanyDto dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND));

        if (!company.getTaxCode().equals(dto.getTaxCode()) && companyRepository.existsByTaxCode(dto.getTaxCode())) {
            throw new AppException(ErrorCode.TAX_CODE_EXISTED);
        }

        company.setName(dto.getName());
        company.setTaxCode(dto.getTaxCode());
        company.setAddress(dto.getAddress());
        company.setPhone(dto.getPhone());
        company.setEmail(dto.getEmail());
        company.setUpdatedAt(OffsetDateTime.now());

        Company updated = companyRepository.save(company);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND));
        company.setDeletedAt(OffsetDateTime.now());
        companyRepository.save(company);
    }

    private CompanyDto mapToDto(Company c) {
        return CompanyDto.builder()
                .id(c.getId())
                .name(c.getName())
                .taxCode(c.getTaxCode())
                .address(c.getAddress())
                .phone(c.getPhone())
                .email(c.getEmail())
                .status("ACTIVE")
                .createdAt(c.getCreatedAt())
                .build();
    }
}
