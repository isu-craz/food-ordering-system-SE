package com.spiceavenue.branch.controller;

import com.spiceavenue.branch.dto.BranchDtos.*;
import com.spiceavenue.branch.service.BranchService;
import com.spiceavenue.common.dto.ApiResponse;
import com.spiceavenue.common.enums.EntityStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
@Tag(name = "Member 1 - Branch Management", description = "Endpoints for restaurant branches, delivery areas, and performance metrics")
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    @Operation(summary = "Get all active branches (or all for managers)")
    public ResponseEntity<ApiResponse<List<BranchResponse>>> getAllBranches(
            @RequestParam(defaultValue = "true") boolean onlyActive) {
        List<BranchResponse> branches = branchService.getAllBranches(onlyActive);
        return ResponseEntity.ok(ApiResponse.success(branches));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get branch details by ID")
    public ResponseEntity<ApiResponse<BranchResponse>> getBranchById(@PathVariable Long id) {
        BranchResponse branch = branchService.getBranchById(id);
        return ResponseEntity.ok(ApiResponse.success(branch));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OPS_MANAGER', 'ADMIN')")
    @Operation(summary = "Create a new restaurant branch (Ops Manager/Admin)")
    public ResponseEntity<ApiResponse<BranchResponse>> createBranch(@Valid @RequestBody CreateBranchRequest request) {
        BranchResponse branch = branchService.createBranch(request);
        return ResponseEntity.ok(ApiResponse.success("Branch created successfully", branch));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPS_MANAGER', 'ADMIN', 'BRANCH_MANAGER')")
    @Operation(summary = "Update branch details")
    public ResponseEntity<ApiResponse<BranchResponse>> updateBranch(
            @PathVariable Long id, @Valid @RequestBody UpdateBranchRequest request) {
        BranchResponse branch = branchService.updateBranch(id, request);
        return ResponseEntity.ok(ApiResponse.success("Branch updated successfully", branch));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('OPS_MANAGER', 'ADMIN')")
    @Operation(summary = "Activate or Deactivate a branch")
    public ResponseEntity<ApiResponse<String>> toggleBranchStatus(
            @PathVariable Long id, @RequestParam EntityStatus status) {
        branchService.toggleBranchStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Branch status updated to " + status, null));
    }

    @PostMapping("/{id}/delivery-areas")
    @PreAuthorize("hasAnyRole('OPS_MANAGER', 'BRANCH_MANAGER', 'ADMIN')")
    @Operation(summary = "Add a supported delivery area for a branch")
    public ResponseEntity<ApiResponse<DeliveryAreaResponse>> addDeliveryArea(
            @PathVariable Long id, @Valid @RequestBody CreateDeliveryAreaRequest request) {
        DeliveryAreaResponse area = branchService.addDeliveryArea(id, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery area added successfully", area));
    }

    @GetMapping("/{id}/delivery-areas")
    @Operation(summary = "Get delivery areas for a branch")
    public ResponseEntity<ApiResponse<List<DeliveryAreaResponse>>> getDeliveryAreas(
            @PathVariable Long id, @RequestParam(defaultValue = "true") boolean onlyActive) {
        List<DeliveryAreaResponse> areas = branchService.getDeliveryAreasForBranch(id, onlyActive);
        return ResponseEntity.ok(ApiResponse.success(areas));
    }

    @GetMapping("/{id}/performance")
    @PreAuthorize("hasAnyRole('OPS_MANAGER', 'BRANCH_MANAGER', 'ADMIN')")
    @Operation(summary = "View operational performance metrics for a branch")
    public ResponseEntity<ApiResponse<BranchPerformanceResponse>> getBranchPerformance(@PathVariable Long id) {
        BranchPerformanceResponse metrics = branchService.getBranchPerformance(id);
        return ResponseEntity.ok(ApiResponse.success(metrics));
    }
}
