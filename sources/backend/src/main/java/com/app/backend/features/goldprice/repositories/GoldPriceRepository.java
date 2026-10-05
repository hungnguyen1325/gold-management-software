package com.app.backend.features.goldprice.repositories;

import com.app.backend.common.entities.GoldPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoldPriceRepository extends JpaRepository<GoldPrice, Long> {
    Optional<GoldPrice> findByGoldType(String goldType);
    List<GoldPrice> findAllByOrderByGoldTypeAsc();
}
