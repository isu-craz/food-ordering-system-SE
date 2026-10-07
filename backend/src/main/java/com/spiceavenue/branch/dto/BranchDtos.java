package com.spiceavenue.branch.dto;

import com.spiceavenue.common.enums.EntityStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
        @Size(min = 3, max = 100, message = "Branch name must be between 3 and 100 characters")
        private String branchName;

        @NotBlank(message = "Street address is required")
        @Size(min = 5, max = 255, message = "Street address must be between 5 and 255 characters")
        private String streetAddress;

        @NotBlank(message = "Contact number is required")
        @Pattern(regexp = "^(\\+94|0)[0-9]{9}$", message = "Contact number must be a valid 10-digit number (e.g. 0812345678 or +94771234567)")
        private String contactNumber;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotNull(message = "Opening time is required")
        private LocalTime openingTime;

        @NotNull(message = "Closing time is required")
        private LocalTime closingTime;

        private Long managerId;
        private List<Long> assignedRiderIds;
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
        private List<Long> assignedRiderIds;
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
        private String managerEmail;
        private EntityStatus status;
        private List<DeliveryAreaResponse> deliveryAreas;
        private List<Long> assignedRiderIds;
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
