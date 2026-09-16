package com.spiceavenue.menu.controller;

import com.spiceavenue.common.dto.ApiResponse;
import com.spiceavenue.menu.dto.MenuDtos.*;
import com.spiceavenue.menu.service.MenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Member 2 - Menu Management", description = "Endpoints for food categories, menu items, variations, and availability")
public class MenuController {

    private final MenuService menuService;

    // Categories
    @GetMapping("/branches/{branchId}/categories")
    @Operation(summary = "Get categories for a specific branch")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            @PathVariable Long branchId, @RequestParam(defaultValue = "true") boolean onlyActive) {
        List<CategoryResponse> categories = menuService.getCategoriesByBranch(branchId, onlyActive);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN')")
    @Operation(summary = "Create a food category (Branch Manager)")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse category = menuService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", category));
    }

    // Menu Items
    @GetMapping("/branches/{branchId}/menu-items")
    @Operation(summary = "Get menu items for a branch")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getMenuItems(
            @PathVariable Long branchId, @RequestParam(defaultValue = "true") boolean onlyActive) {
        List<MenuItemResponse> items = menuService.getMenuItemsByBranch(branchId, onlyActive);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @GetMapping("/menu-items/{id}")
    @Operation(summary = "Get single menu item by ID")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getMenuItemById(@PathVariable Long id) {
        MenuItemResponse item = menuService.getMenuItemById(id);
        return ResponseEntity.ok(ApiResponse.success(item));
    }

    @PostMapping("/menu-items")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN')")
    @Operation(summary = "Create a new menu item (Branch Manager)")
    public ResponseEntity<ApiResponse<MenuItemResponse>> createMenuItem(@Valid @RequestBody CreateMenuItemRequest request) {
        MenuItemResponse item = menuService.createMenuItem(request);
        return ResponseEntity.ok(ApiResponse.success("Menu item created successfully", item));
    }

    @PutMapping("/menu-items/{id}")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN')")
    @Operation(summary = "Update menu item details")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateMenuItem(
            @PathVariable Long id, @RequestBody UpdateMenuItemRequest request) {
        MenuItemResponse item = menuService.updateMenuItem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Menu item updated successfully", item));
    }

    @PatchMapping("/menu-items/{id}/availability")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN')")
    @Operation(summary = "Toggle menu item stock availability (Available vs Out of Stock)")
    public ResponseEntity<ApiResponse<String>> toggleAvailability(
            @PathVariable Long id, @RequestParam boolean isAvailable) {
        menuService.toggleItemAvailability(id, isAvailable);
        return ResponseEntity.ok(ApiResponse.success("Availability updated to " + (isAvailable ? "Available" : "Out of Stock"), null));
    }

    // Variations
    @PostMapping("/menu-items/{itemId}/variations")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN')")
    @Operation(summary = "Add an item variation (e.g. Small, Medium, Large)")
    public ResponseEntity<ApiResponse<VariationResponse>> addVariation(
            @PathVariable Long itemId, @Valid @RequestBody CreateVariationRequest request) {
        VariationResponse variation = menuService.addVariation(itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Variation added successfully", variation));
    }

    @PutMapping("/variations/{id}")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN')")
    @Operation(summary = "Update an item variation")
    public ResponseEntity<ApiResponse<VariationResponse>> updateVariation(
            @PathVariable Long id, @Valid @RequestBody UpdateVariationRequest request) {
        VariationResponse variation = menuService.updateVariation(id, request);
        return ResponseEntity.ok(ApiResponse.success("Variation updated successfully", variation));
    }

    @DeleteMapping("/variations/{id}")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'ADMIN')")
    @Operation(summary = "Delete an item variation")
    public ResponseEntity<ApiResponse<String>> deleteVariation(@PathVariable Long id) {
        menuService.deleteVariation(id);
        return ResponseEntity.ok(ApiResponse.success("Variation deleted successfully", null));
    }

    @GetMapping("/branches/{branchId}/menu-items/search")
    @Operation(summary = "Search menu items by name query")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> searchMenuItems(
            @PathVariable Long branchId, @RequestParam String query) {
        List<MenuItemResponse> results = menuService.searchMenuItems(branchId, query);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
