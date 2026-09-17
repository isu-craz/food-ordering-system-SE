package com.spiceavenue.branch.dto;

import com.spiceavenue.common.enums.EntityStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

public class BranchDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateBranchRequest {
        @NotBlank(message = "Branch name is required")
        private String branchName;

        @NotBlank(message = "Street address is required")
        private String streetAddress;

        @NotBlank(message = "Contact number is required")
        private String contactNumber;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotNull(message = "Opening time is required")
        private LocalTime openingTime;

        @NotNull(message = "Closing time is required")
        private LocalTime closingTime;

        private Long managerId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateBranchRequest {
        private String branchName;
        private String streetAddress;
        private String contactNumber;
        private String email;
        private LocalTime openingTime;
        private LocalTime closingTime;
        private EntityStatus status;
        private Long managerId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BranchResponse {
        private Long branchId;
        private String branchName;
        private String streetAddress;
        private String contactNumber;
        private String email;
        private LocalTime openingTime;
        private LocalTime closingTime;
        private Long managerId;
        private String managerName;
        private EntityStatus status;
        private List<DeliveryAreaResponse> deliveryAreas;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateDeliveryAreaRequest {
        @NotBlank(message = "Delivery area name is required")
        private String areaName;

        @NotNull(message = "Delivery fee is required")
        private BigDecimal deliveryFee;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeliveryAreaResponse {
        private Long areaId;
        private Long branchId;
        private String areaName;
        private BigDecimal deliveryFee;
        private EntityStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BranchPerformanceResponse {
        private Long branchId;
        private String branchName;
        private long totalOrders;
        private BigDecimal totalRevenue;
        private long completedOrders;
        private long cancelledOrders;
        private long pickupOrders;
        private long deliveryOrders;
        private double averageRating;
        private long complaintCount;
    }
}
