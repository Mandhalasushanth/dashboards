package com.taxedge.dashboards.camanagers.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxedge.dashboards.auth.dto.ManagerLoginDto;
import com.taxedge.dashboards.auth.enums.ManagerRole;
import com.taxedge.dashboards.camanagers.service.CaManagerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CaManagerController {

    private final CaManagerService caManagerService;

    @GetMapping("/admin/managers")
    public ResponseEntity<List<ManagerLoginDto>> getManagers(@RequestParam(required = false) ManagerRole role) {
        log.info("Received request for managers with role: {}", role);
        return ResponseEntity.ok(caManagerService.getManagers(role));
    }

    @GetMapping("/admin/managers/{id}")
    public ResponseEntity<ManagerLoginDto> getManagerById(@PathVariable Long id) {
        log.info("Received request for manager with id: {}", id);
        return ResponseEntity.ok(caManagerService.getManagerById(id));
    }

    @PutMapping("/admin/managers/{id}")
    public ResponseEntity<ManagerLoginDto> updateManager(
            @PathVariable Long id,
            @RequestBody ManagerLoginDto managerLoginDto) {
        log.info("Received request to update manager with id: {}", id);
        return ResponseEntity.ok(caManagerService.updateManager(id, managerLoginDto));
    }

    @DeleteMapping("/admin/managers/{id}")
    public ResponseEntity<Void> deleteManager(@PathVariable Long id) {
        log.info("Received request to delete manager with id: {}", id);
        caManagerService.deleteManager(id);
        return ResponseEntity.noContent().build();
    }
}

