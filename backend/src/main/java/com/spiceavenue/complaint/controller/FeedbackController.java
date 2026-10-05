package com.spiceavenue.complaint.controller;

import com.spiceavenue.common.dto.ApiResponse;
import com.spiceavenue.common.enums.ComplaintStatus;
import com.spiceavenue.complaint.dto.FeedbackDtos.*;
import com.spiceavenue.complaint.service.ComplaintAndReviewService;
import com.spiceavenue.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Member 6 - Complaint & Review Management", description = "Endpoints for customer complaints, post-order star reviews, and supervisor feedback analytics")
public class FeedbackController {

    private final ComplaintAndReviewService feedbackService;

    // Complaints Endpoints
    @PostMapping("/customer/complaints")
    @Operation(summary = "Submit a complaint for an order")
    public ResponseEntity<ApiResponse<ComplaintResponse>> submitComplaint(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody SubmitComplaintRequest request) {
        ComplaintResponse complaint = feedbackService.submitComplaint(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Complaint submitted successfully", complaint));
    }

    @GetMapping("/customer/my-complaints")
    @Operation(summary = "View current customer's complaints and statuses")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getMyComplaints(
            @AuthenticationPrincipal UserDetailsImpl user) {
        List<ComplaintResponse> complaints = feedbackService.getCustomerComplaints(user.getId());
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @GetMapping("/supervisor/complaints")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'OPS_MANAGER', 'ADMIN', 'BRANCH_MANAGER')")
    @Operation(summary = "Get list of customer complaints for supervision queue")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getSupervisorComplaints(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Long branchId) {
        List<ComplaintResponse> complaints = feedbackService.getSupervisorComplaints(status, branchId);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    @PatchMapping("/supervisor/complaints/{id}/status")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'OPS_MANAGER', 'ADMIN')")
    @Operation(summary = "Update complaint status (e.g. mark IN_PROGRESS)")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaintStatus(
            @PathVariable Long id, @RequestParam ComplaintStatus status) {
        ComplaintResponse complaint = feedbackService.updateComplaintStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Complaint status updated to " + status, complaint));
    }

    @PatchMapping("/supervisor/complaints/{id}/resolve")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'OPS_MANAGER', 'ADMIN')")
    @Operation(summary = "Resolve customer complaint with mandatory resolution notes")
    public ResponseEntity<ApiResponse<ComplaintResponse>> resolveComplaint(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody ResolveComplaintRequest request) {
        ComplaintResponse complaint = feedbackService.resolveComplaint(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Complaint resolved and closed successfully", complaint));
    }

    @PatchMapping("/supervisor/complaints/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'OPS_MANAGER', 'ADMIN')")
    @Operation(summary = "Reject an invalid customer complaint with mandatory reason")
    public ResponseEntity<ApiResponse<ComplaintResponse>> rejectComplaint(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody RejectComplaintRequest request) {
        ComplaintResponse complaint = feedbackService.rejectComplaint(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Complaint rejected", complaint));
    }

    @DeleteMapping("/supervisor/complaints/{id}")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'ADMIN')")
    @Operation(summary = "Delete a complaint ticket")
    public ResponseEntity<ApiResponse<String>> deleteComplaint(@PathVariable Long id) {
        feedbackService.deleteComplaint(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint deleted successfully", null));
    }

    // Reviews Endpoints
    @PostMapping("/customer/reviews")
    @Operation(summary = "Submit a 1-5 star review for an order")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody SubmitReviewRequest request) {
        ReviewResponse review = feedbackService.submitReview(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review submitted successfully", review));
    }

    @PutMapping("/customer/reviews/{id}")
    @Operation(summary = "Update your existing review")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody UpdateReviewRequest request) {
        ReviewResponse review = feedbackService.updateReview(id, user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Review updated", review));
    }

    @DeleteMapping("/customer/reviews/{id}")
    @Operation(summary = "Delete submitted review")
    public ResponseEntity<ApiResponse<String>> deleteReview(
            @PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl user) {
        feedbackService.deleteReview(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    @GetMapping("/customer/my-reviews")
    @Operation(summary = "Get all reviews submitted by the logged in customer")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserDetailsImpl user) {
        List<ReviewResponse> reviews = feedbackService.getCustomerReviews(user.getId());
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/branches/{branchId}/reviews")
    @Operation(summary = "Get customer reviews for a specific branch")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getBranchReviews(@PathVariable Long branchId) {
        List<ReviewResponse> reviews = feedbackService.getAllReviews(branchId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/supervisor/reviews")
    @Operation(summary = "Get all customer reviews (system-wide or by branch)")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getAllReviews(
            @RequestParam(required = false) Long branchId) {
        List<ReviewResponse> reviews = feedbackService.getAllReviews(branchId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/supervisor/feedback-analytics")
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'OPS_MANAGER', 'ADMIN', 'BRANCH_MANAGER')")
    @Operation(summary = "Get overall feedback analytics and rating metrics")
    public ResponseEntity<ApiResponse<FeedbackAnalyticsResponse>> getFeedbackAnalytics() {
        FeedbackAnalyticsResponse analytics = feedbackService.getFeedbackAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
