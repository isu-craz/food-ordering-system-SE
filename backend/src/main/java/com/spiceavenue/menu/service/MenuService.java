package com.spiceavenue.menu.service;

import com.spiceavenue.branch.entity.Branch;
import com.spiceavenue.branch.repository.BranchRepository;
import com.spiceavenue.common.enums.EntityStatus;
import com.spiceavenue.common.exception.BadRequestException;
import com.spiceavenue.common.exception.ResourceNotFoundException;
import com.spiceavenue.menu.dto.MenuDtos.*;
import com.spiceavenue.menu.entity.Category;
import com.spiceavenue.menu.entity.MenuItem;
import com.spiceavenue.menu.entity.MenuVariation;
import com.spiceavenue.menu.repository.CategoryRepository;
import com.spiceavenue.menu.repository.MenuItemRepository;
import com.spiceavenue.menu.repository.MenuVariationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuVariationRepository menuVariationRepository;
    private final BranchRepository branchRepository;

    public List<CategoryResponse> getCategoriesByBranch(Long branchId, boolean onlyActive) {
        List<Category> categories = onlyActive
                ? categoryRepository.findByBranch_BranchIdAndStatus(branchId, EntityStatus.ACTIVE)
                : categoryRepository.findByBranch_BranchId(branchId);
        return categories.stream().map(this::mapToCategoryResponse).collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));

        if (categoryRepository.existsByBranch_BranchIdAndCategoryName(request.getBranchId(), request.getCategoryName())) {
            throw new BadRequestException("A category with this name already exists in this branch");
        }

        Category category = Category.builder()
                .branch(branch)
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .status(EntityStatus.ACTIVE)
                .build();

        return mapToCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long categoryId, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (request.getCategoryName() != null && !request.getCategoryName().isBlank()) {
            category.setCategoryName(request.getCategoryName());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        return mapToCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        try {
            categoryRepository.delete(category);
            categoryRepository.flush();
        } catch (Exception e) {
            category.setStatus(EntityStatus.INACTIVE);
            categoryRepository.save(category);
        }
    }

    public List<MenuItemResponse> getMenuItemsByBranch(Long branchId, boolean onlyActive) {
        List<MenuItem> items = onlyActive
                ? menuItemRepository.findByBranch_BranchIdAndStatus(branchId, EntityStatus.ACTIVE)
                : menuItemRepository.findByBranch_BranchId(branchId);
        return items.stream().map(this::mapToMenuItemResponse).collect(Collectors.toList());
    }

    public MenuItemResponse getMenuItemById(Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found with ID: " + itemId));
        return mapToMenuItemResponse(item);
    }

    @Transactional
    public MenuItemResponse createMenuItem(CreateMenuItemRequest request) {
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        MenuItem item = MenuItem.builder()
                .branch(branch)
                .category(category)
                .foodName(request.getFoodName())
                .description(request.getDescription())
                .basePrice(request.getBasePrice())
                .imageUrl(request.getImageUrl())
                .available(true)
                .status(EntityStatus.ACTIVE)
                .build();

        return mapToMenuItemResponse(menuItemRepository.save(item));
    }

    @Transactional
    public MenuItemResponse updateMenuItem(Long itemId, UpdateMenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        if (request.getFoodName() != null) item.setFoodName(request.getFoodName());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getBasePrice() != null) item.setBasePrice(request.getBasePrice());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());
        if (request.getIsAvailable() != null) item.setAvailable(request.getIsAvailable());
        if (request.getStatus() != null) item.setStatus(request.getStatus());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            item.setCategory(category);
        }

        return mapToMenuItemResponse(menuItemRepository.save(item));
    }

    @Transactional
    public void toggleItemAvailability(Long itemId, boolean isAvailable) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        item.setAvailable(isAvailable);
        menuItemRepository.save(item);
    }

    @Transactional
    public void deleteMenuItem(Long itemId) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
        try {
            menuItemRepository.delete(item);
            menuItemRepository.flush();
        } catch (Exception e) {
            item.setStatus(EntityStatus.INACTIVE);
            menuItemRepository.save(item);
        }
    }

    @Transactional
    public VariationResponse addVariation(Long itemId, CreateVariationRequest request) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));

        MenuVariation variation = MenuVariation.builder()
                .menuItem(item)
                .variationName(request.getVariationName())
                .additionalPrice(request.getAdditionalPrice())
                .status(EntityStatus.ACTIVE)
                .build();

        return mapToVariationResponse(menuVariationRepository.save(variation));
    }

    @Transactional
    public VariationResponse updateVariation(Long variationId, UpdateVariationRequest request) {
        MenuVariation variation = menuVariationRepository.findById(variationId)
                .orElseThrow(() -> new ResourceNotFoundException("Variation not found"));

        variation.setVariationName(request.getVariationName());
        variation.setAdditionalPrice(request.getAdditionalPrice());

        return mapToVariationResponse(menuVariationRepository.save(variation));
    }

    @Transactional
    public void deleteVariation(Long variationId) {
        MenuVariation variation = menuVariationRepository.findById(variationId)
                .orElseThrow(() -> new ResourceNotFoundException("Variation not found"));
        try {
            menuVariationRepository.delete(variation);
            menuVariationRepository.flush();
        } catch (Exception e) {
            variation.setStatus(EntityStatus.INACTIVE);
            menuVariationRepository.save(variation);
        }
    }

    public List<MenuItemResponse> searchMenuItems(Long branchId, String query) {
        List<MenuItem> items = menuItemRepository.findByBranch_BranchIdAndFoodNameContainingIgnoreCaseAndStatus(
                branchId, query, EntityStatus.ACTIVE);
        return items.stream().map(this::mapToMenuItemResponse).collect(Collectors.toList());
    }

    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .branchId(category.getBranch().getBranchId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .status(category.getStatus())
                .build();
    }

    private MenuItemResponse mapToMenuItemResponse(MenuItem item) {
        List<VariationResponse> variations = item.getVariations() != null ?
                item.getVariations().stream()
                        .filter(v -> v.getStatus() == EntityStatus.ACTIVE)
                        .map(this::mapToVariationResponse)
                        .collect(Collectors.toList()) : List.of();

        return MenuItemResponse.builder()
                .itemId(item.getItemId())
                .branchId(item.getBranch().getBranchId())
                .categoryId(item.getCategory().getCategoryId())
                .categoryName(item.getCategory().getCategoryName())
                .foodName(item.getFoodName())
                .description(item.getDescription())
                .basePrice(item.getBasePrice())
                .imageUrl(item.getImageUrl())
                .isAvailable(item.isAvailable())
                .status(item.getStatus())
                .variations(variations)
                .build();
    }

    private VariationResponse mapToVariationResponse(MenuVariation v) {
        return VariationResponse.builder()
                .variationId(v.getVariationId())
                .itemId(v.getMenuItem().getItemId())
                .variationName(v.getVariationName())
                .additionalPrice(v.getAdditionalPrice())
                .status(v.getStatus())
                .build();
    }
}
