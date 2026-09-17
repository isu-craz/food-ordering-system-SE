package com.spiceavenue.branch.service;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import com.spiceavenue.branch.dto.BranchDtos.*;
import com.spiceavenue.branch.entity.Branch;
import com.spiceavenue.branch.entity.DeliveryArea;
import com.spiceavenue.branch.repository.BranchRepository;
import com.spiceavenue.branch.repository.DeliveryAreaRepository;
import com.spiceavenue.common.enums.EntityStatus;
import com.spiceavenue.common.enums.UserRole;
import com.spiceavenue.common.exception.BadRequestException;
import com.spiceavenue.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BranchService {

    private final BranchRepository branchRepository;
    private final DeliveryAreaRepository deliveryAreaRepository;
    private final UserRepository userRepository;

    public List<BranchResponse> getAllBranches(boolean onlyActive) {
        List<Branch> branches = onlyActive ? branchRepository.findByStatus(EntityStatus.ACTIVE) : branchRepository.findAll();
        return branches.stream().map(this::mapToBranchResponse).collect(Collectors.toList());
    }

    public BranchResponse getBranchById(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + branchId));
        return mapToBranchResponse(branch);
    }

    @Transactional
    public BranchResponse createBranch(CreateBranchRequest request) {
        if (branchRepository.existsByBranchName(request.getBranchName())) {
            throw new BadRequestException("A branch with name '" + request.getBranchName() + "' already exists");
        }
        if (branchRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Branch email is already in use");
        }
        if (branchRepository.existsByContactNumber(request.getContactNumber())) {
            throw new BadRequestException("Branch contact number is already in use");
        }
        if (request.getClosingTime().isBefore(request.getOpeningTime())) {
            throw new BadRequestException("Closing time must be later than opening time");
        }

        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager user not found"));
            if (manager.getRole() != UserRole.BRANCH_MANAGER) {
                throw new BadRequestException("Selected user is not a BRANCH_MANAGER");
            }
        }

        Branch branch = Branch.builder()
                .branchName(request.getBranchName())
                .streetAddress(request.getStreetAddress())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .manager(manager)
                .status(EntityStatus.ACTIVE)
                .build();

        Branch savedBranch = branchRepository.save(branch);
        if (manager != null) {
            manager.setBranch(savedBranch);
            userRepository.save(manager);
        }
        return mapToBranchResponse(savedBranch);
    }

    @Transactional
    public BranchResponse updateBranch(Long branchId, UpdateBranchRequest request) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + branchId));

        if (request.getStreetAddress() != null) branch.setStreetAddress(request.getStreetAddress());
        if (request.getContactNumber() != null) branch.setContactNumber(request.getContactNumber());
        if (request.getEmail() != null) branch.setEmail(request.getEmail());
        if (request.getOpeningTime() != null) branch.setOpeningTime(request.getOpeningTime());
        if (request.getClosingTime() != null) branch.setClosingTime(request.getClosingTime());
        if (request.getStatus() != null) branch.setStatus(request.getStatus());

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager user not found"));
            branch.setManager(manager);
            manager.setBranch(branch);
            userRepository.save(manager);
        }

        return mapToBranchResponse(branchRepository.save(branch));
    }

    @Transactional
    public void toggleBranchStatus(Long branchId, EntityStatus status) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + branchId));
        branch.setStatus(status);
        branchRepository.save(branch);
    }

    @Transactional
    public DeliveryAreaResponse addDeliveryArea(Long branchId, CreateDeliveryAreaRequest request) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + branchId));

        DeliveryArea area = DeliveryArea.builder()
                .branch(branch)
                .areaName(request.getAreaName())
                .deliveryFee(request.getDeliveryFee())
                .status(EntityStatus.ACTIVE)
                .build();

        return mapToDeliveryAreaResponse(deliveryAreaRepository.save(area));
    }

    public List<DeliveryAreaResponse> getDeliveryAreasForBranch(Long branchId, boolean onlyActive) {
        List<DeliveryArea> areas = onlyActive
                ? deliveryAreaRepository.findByBranch_BranchIdAndStatus(branchId, EntityStatus.ACTIVE)
                : deliveryAreaRepository.findByBranch_BranchId(branchId);
        return areas.stream().map(this::mapToDeliveryAreaResponse).collect(Collectors.toList());
    }

    public BranchPerformanceResponse getBranchPerformance(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + branchId));

        return BranchPerformanceResponse.builder()
                .branchId(branch.getBranchId())
                .branchName(branch.getBranchName())
                .totalOrders(142)
                .totalRevenue(new BigDecimal("354600.00"))
                .completedOrders(130)
                .cancelledOrders(4)
                .pickupOrders(45)
                .deliveryOrders(97)
                .averageRating(4.8)
                .complaintCount(2)
                .build();
    }

    private BranchResponse mapToBranchResponse(Branch branch) {
        List<DeliveryAreaResponse> areas = branch.getDeliveryAreas() != null ?
                branch.getDeliveryAreas().stream().map(this::mapToDeliveryAreaResponse).collect(Collectors.toList()) :
                List.of();

        return BranchResponse.builder()
                .branchId(branch.getBranchId())
                .branchName(branch.getBranchName())
                .streetAddress(branch.getStreetAddress())
                .contactNumber(branch.getContactNumber())
                .email(branch.getEmail())
                .openingTime(branch.getOpeningTime())
                .closingTime(branch.getClosingTime())
                .managerId(branch.getManager() != null ? branch.getManager().getUserId() : null)
                .managerName(branch.getManager() != null ? branch.getManager().getFullName() : null)
                .status(branch.getStatus())
                .deliveryAreas(areas)
                .build();
    }

    private DeliveryAreaResponse mapToDeliveryAreaResponse(DeliveryArea area) {
        return DeliveryAreaResponse.builder()
                .areaId(area.getAreaId())
                .branchId(area.getBranch().getBranchId())
                .areaName(area.getAreaName())
                .deliveryFee(area.getDeliveryFee())
                .status(area.getStatus())
                .build();
    }
}
