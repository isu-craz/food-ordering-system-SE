package com.spiceavenue.complaint.dto;

import com.spiceavenue.common.enums.ComplaintStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FeedbackDtos {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitComplaintRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;

        @NotBlank(message = "Complaint category is required")
        private String category;

        @NotBlank(message = "Description is required")
        private String description;

        private String imageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResolveComplaintRequest {
        @NotBlank(message = "Resolution notes are required")
        private String resolutionNotes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RejectComplaintRequest {
        @NotBlank(message = "Rejection reason is required")
        private String rejectionReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComplaintResponse {
        private Long complaintId;
        private Long orderId;
        private String orderNumber;
        private Long branchId;
        private String branchName;
        private BigDecimal orderTotal;
        private Long customerId;
        private String customerName;
        private String customerPhone;
        private String category;
        private String description;
        private String imageUrl;
        private ComplaintStatus status;
        private String resolutionNotes;
        private String resolvedByName;
        private LocalDateTime resolvedAt;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitReviewRequest {
        @NotNull(message = "Order ID is required")
        private Long orderId;

        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        private Integer rating;

        private String comment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateReviewRequest {
        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        private Integer rating;

        private String comment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewResponse {
        private Long reviewId;
        private Long orderId;
        private String orderNumber;
        private Long branchId;
        private String branchName;
        private Long customerId;
        private String customerName;
        private int rating;
        private String comment;
        private LocalDateTime reviewDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FeedbackAnalyticsResponse {
        private double averageRating;
        private long totalReviews;
        private long fiveStarCount;
        private long fourStarCount;
        private long threeStarCount;
        private long twoStarCount;
        private long oneStarCount;
        private long totalComplaints;
        private long pendingComplaints;
        private long inProgressComplaints;
        private long resolvedComplaints;
        private long rejectedComplaints;
        private double resolutionRate;
    }
}
