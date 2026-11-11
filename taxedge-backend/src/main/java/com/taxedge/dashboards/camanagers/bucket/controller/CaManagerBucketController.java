package com.taxedge.dashboards.camanagers.bucket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.camanagers.bucket.dto.AddToBucketRequestDto;
import com.taxedge.dashboards.camanagers.bucket.dto.BucketSummaryDto;
import com.taxedge.dashboards.camanagers.bucket.dto.UpdateBucketRequestDto;
import com.taxedge.dashboards.camanagers.bucket.entity.CaManagerBucketItem;
import com.taxedge.dashboards.camanagers.bucket.service.CaManagerBucketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/v1/bucket")
@RequiredArgsConstructor
public class CaManagerBucketController {

    private final CaManagerBucketService bucketService;

    @PostMapping("/add")
    public ResponseEntity<String> addToBucket(@Valid @RequestBody AddToBucketRequestDto request) {
        log.info("REST request to add application [{}] ({}) to CA Manager bucket",
                request.getApplicationId(), request.getApplicationCategory());
        String message = bucketService.addToBucket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateBucketItem(
            @PathVariable Long id,
            @RequestBody UpdateBucketRequestDto request) {
        log.info("REST request to update bucket item [{}]", id);
        return ResponseEntity.ok(bucketService.updateBucketItem(id, request));
    }

   

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBucketItem(@PathVariable Long id) {
        log.info("REST request to remove bucket item [{}]", id);
        return ResponseEntity.ok(bucketService.deleteBucketItem(id));
    }

    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<CaManagerBucketItem>> getBucketDetailsByManagerId(@PathVariable Long managerId) {
        log.info("REST request to get bucket details for manager ID [{}]", managerId);
        return ResponseEntity.ok(bucketService.getBucketDetailsByManagerId(managerId));
    }

   

    @GetMapping("/summary")
    public ResponseEntity<BucketSummaryDto> getBucketSummary() {
        log.info("REST request to get CA Manager bucket counts summary");
        return ResponseEntity.ok(bucketService.getBucketSummary());
    }
}
