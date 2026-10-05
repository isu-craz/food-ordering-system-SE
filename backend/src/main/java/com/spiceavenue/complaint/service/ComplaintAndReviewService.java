package com.spiceavenue.complaint.service;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import com.spiceavenue.common.enums.ComplaintStatus;
import com.spiceavenue.common.enums.UserRole;
import com.spiceavenue.common.exception.BadRequestException;
import com.spiceavenue.common.exception.ResourceNotFoundException;
import com.spiceavenue.complaint.dto.FeedbackDtos.*;
import com.spiceavenue.complaint.entity.Complaint;
import com.spiceavenue.complaint.entity.Review;
import com.spiceavenue.complaint.repository.ComplaintRepository;
import com.spiceavenue.complaint.repository.ReviewRepository;
import com.spiceavenue.ordering.entity.Order;
import com.spiceavenue.ordering.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ComplaintAndReviewService {

    private final ComplaintRepository complaintRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    // Complaints Logic
    @Transactional
    public ComplaintResponse submitComplaint(Long customerId, SubmitComplaintRequest request) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        // If regular customer, ensure order belongs to customer
        if (user.getRole() == UserRole.CUSTOMER && !order.getCustomer().getUserId().equals(customerId)) {
            throw new BadRequestException("You can only submit complaints for your own orders");
        }

        Complaint complaint = Complaint.builder()
                .order(order)
                .customer(order.getCustomer() != null ? order.getCustomer() : user)
                .category(request.getCategory())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .status(ComplaintStatus.PENDING)
                .build();

        return mapToComplaintResponse(complaintRepository.save(complaint));
    }

    public List<ComplaintResponse> getCustomerComplaints(Long customerId) {
        return complaintRepository.findByCustomer_UserIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    public List<ComplaintResponse> getSupervisorComplaints(ComplaintStatus status, Long branchId) {
        List<Complaint> complaints = complaintRepository.findAll();

        return complaints.stream()
                .filter(c -> status == null || c.getStatus() == status)
                .filter(c -> branchId == null || (c.getOrder().getBranch() != null && c.getOrder().getBranch().getBranchId().equals(branchId)))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToComplaintResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse updateComplaintStatus(Long complaintId, ComplaintStatus status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));

        complaint.setStatus(status);
        return mapToComplaintResponse(complaintRepository.save(complaint));
    }

    @Transactional
    public ComplaintResponse resolveComplaint(Long complaintId, Long supervisorId, ResolveComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor not found"));

        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setResolutionNotes(request.getResolutionNotes());
        complaint.setResolvedBy(supervisor);
        complaint.setResolvedAt(LocalDateTime.now());

        return mapToComplaintResponse(complaintRepository.save(complaint));
    }

    @Transactional
    public ComplaintResponse rejectComplaint(Long complaintId, Long supervisorId, RejectComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        User supervisor = userRepository.findById(supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor not found"));

        complaint.setStatus(ComplaintStatus.REJECTED);
        complaint.setResolutionNotes("REJECTED: " + request.getRejectionReason());
        complaint.setResolvedBy(supervisor);
        complaint.setResolvedAt(LocalDateTime.now());

        return mapToComplaintResponse(complaintRepository.save(complaint));
    }

    @Transactional
    public void deleteComplaint(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with ID: " + complaintId));
        complaintRepository.delete(complaint);
    }

    // Reviews Logic
    @Transactional
    public ReviewResponse submitReview(Long customerId, SubmitReviewRequest request) {
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        // Check if review already exists for this order -> UPDATE it
        Optional<Review> existingReview = reviewRepository.findByOrder_OrderId(order.getOrderId());
        if (existingReview.isPresent()) {
            Review review = existingReview.get();
            review.setRating(request.getRating());
            review.setComment(request.getComment());
            return mapToReviewResponse(reviewRepository.save(review));
        }

        Review review = Review.builder()
                .order(order)
                .customer(order.getCustomer() != null ? order.getCustomer() : user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return mapToReviewResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, Long customerId, UpdateReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return mapToReviewResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(Long reviewId, Long customerId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));
        reviewRepository.delete(review);
    }

    public List<ReviewResponse> getCustomerReviews(Long customerId) {
        return reviewRepository.findByCustomer_UserIdOrderByReviewDateDesc(customerId).stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getAllReviews(Long branchId) {
        List<Review> reviews = branchId != null
                ? reviewRepository.findByOrder_Branch_BranchIdOrderByReviewDateDesc(branchId)
                : reviewRepository.findAll();

        return reviews.stream()
                .sorted((a, b) -> b.getReviewDate().compareTo(a.getReviewDate()))
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());
    }

    public FeedbackAnalyticsResponse getFeedbackAnalytics() {
        List<Review> reviews = reviewRepository.findAll();
        List<Complaint> complaints = complaintRepository.findAll();

        double avgRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        long fiveStar = reviews.stream().filter(r -> r.getRating() == 5).count();
        long fourStar = reviews.stream().filter(r -> r.getRating() == 4).count();
        long threeStar = reviews.stream().filter(r -> r.getRating() == 3).count();
        long twoStar = reviews.stream().filter(r -> r.getRating() == 2).count();
        long oneStar = reviews.stream().filter(r -> r.getRating() == 1).count();

        long pending = complaints.stream().filter(c -> c.getStatus() == ComplaintStatus.PENDING).count();
        long inProgress = complaints.stream().filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS).count();
        long resolved = complaints.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED).count();
        long rejected = complaints.stream().filter(c -> c.getStatus() == ComplaintStatus.REJECTED).count();

        double resRate = complaints.isEmpty() ? 100.0 : Math.round(((double) resolved / complaints.size()) * 1000.0) / 10.0;

        return FeedbackAnalyticsResponse.builder()
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .totalReviews(reviews.size())
                .fiveStarCount(fiveStar)
                .fourStarCount(fourStar)
                .threeStarCount(threeStar)
                .twoStarCount(twoStar)
                .oneStarCount(oneStar)
                .totalComplaints(complaints.size())
                .pendingComplaints(pending)
                .inProgressComplaints(inProgress)
                .resolvedComplaints(resolved)
                .rejectedComplaints(rejected)
                .resolutionRate(resRate)
                .build();
    }

    private ComplaintResponse mapToComplaintResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .complaintId(complaint.getComplaintId())
                .orderId(complaint.getOrder().getOrderId())
                .orderNumber(complaint.getOrder().getOrderNumber())
                .branchId(complaint.getOrder().getBranch() != null ? complaint.getOrder().getBranch().getBranchId() : null)
                .branchName(complaint.getOrder().getBranch() != null ? complaint.getOrder().getBranch().getBranchName() : "Main Branch")
                .orderTotal(complaint.getOrder().getTotalAmount())
                .customerId(complaint.getCustomer().getUserId())
                .customerName(complaint.getCustomer().getFullName())
                .customerPhone(complaint.getCustomer().getPhoneNumber())
                .category(complaint.getCategory())
                .description(complaint.getDescription())
                .imageUrl(complaint.getImageUrl())
                .status(complaint.getStatus())
                .resolutionNotes(complaint.getResolutionNotes())
                .resolvedByName(complaint.getResolvedBy() != null ? complaint.getResolvedBy().getFullName() : null)
                .resolvedAt(complaint.getResolvedAt())
                .createdAt(complaint.getCreatedAt())
                .build();
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .orderId(review.getOrder().getOrderId())
                .orderNumber(review.getOrder().getOrderNumber())
                .branchId(review.getOrder().getBranch() != null ? review.getOrder().getBranch().getBranchId() : null)
                .branchName(review.getOrder().getBranch() != null ? review.getOrder().getBranch().getBranchName() : "Main Branch")
                .customerId(review.getCustomer().getUserId())
                .customerName(review.getCustomer().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewDate(review.getReviewDate())
                .build();
    }
}
