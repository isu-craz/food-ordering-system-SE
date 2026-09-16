package com.spiceavenue.menu.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.spiceavenue.common.enums.EntityStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class MenuDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateCategoryRequest {
        @NotNull(message = "Branch ID is required")
        private Long branchId;

        @NotBlank(message = "Category name is required")
        private String categoryName;

        private String description;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryResponse {
        private Long categoryId;
        private Long branchId;
        private String categoryName;
        private String description;
        private EntityStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateMenuItemRequest {
        @NotNull(message = "Branch ID is required")
        private Long branchId;

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotBlank(message = "Food name is required")
        private String foodName;

        private String description;

        @NotNull(message = "Base price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        private BigDecimal basePrice;

        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateMenuItemRequest {
        private String foodName;
        private String description;
        private BigDecimal basePrice;
        private String imageUrl;
        private Long categoryId;
        @JsonProperty("isAvailable")
        private Boolean isAvailable;
        private EntityStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateVariationRequest {
        @NotBlank(message = "Variation name is required")
        private String variationName;

        @NotNull(message = "Additional price is required")
        @DecimalMin(value = "0.0", message = "Additional price cannot be negative")
        private BigDecimal additionalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateVariationRequest {
        @NotBlank(message = "Variation name is required")
        private String variationName;

        @NotNull(message = "Additional price is required")
        @DecimalMin(value = "0.0", message = "Additional price cannot be negative")
        private BigDecimal additionalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VariationResponse {
        private Long variationId;
        private Long itemId;
        private String variationName;
        private BigDecimal additionalPrice;
        private EntityStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MenuItemResponse {
        private Long itemId;
        private Long branchId;
        private Long categoryId;
        private String categoryName;
        private String foodName;
        private String description;
        private BigDecimal basePrice;
        private String imageUrl;

        @JsonProperty("isAvailable")
        private boolean isAvailable;

        @JsonProperty("available")
        public boolean isAvailableField() {
            return isAvailable;
        }

        private EntityStatus status;
        private List<VariationResponse> variations;
    }
}
