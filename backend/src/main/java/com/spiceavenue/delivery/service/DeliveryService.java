package com.spiceavenue.delivery.service;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import com.spiceavenue.common.enums.OrderStatus;
import com.spiceavenue.common.enums.RiderStatus;
import com.spiceavenue.common.enums.UserRole;
import com.spiceavenue.common.exception.BadRequestException;
import com.spiceavenue.common.exception.ResourceNotFoundException;
import com.spiceavenue.delivery.dto.DeliveryDtos.*;
import com.spiceavenue.delivery.entity.Delivery;
import com.spiceavenue.delivery.entity.Delivery.DeliveryStatus;
import com.spiceavenue.delivery.repository.DeliveryRepository;
import com.spiceavenue.ordering.entity.Order;
import com.spiceavenue.ordering.repository.OrderRepository;
import com.spiceavenue.ordering.service.CustomerOrderingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CustomerOrderingService customerOrderingService;


    // =========================
    // GET AVAILABLE RIDERS
    // =========================

    public List<AvailableRiderResponse> getAvailableRiders() {

        return userRepository
                .findByRoleAndRiderStatus(
                        UserRole.RIDER,
                        RiderStatus.AVAILABLE
                )
                .stream()
                .map(r -> AvailableRiderResponse.builder()
                        .riderId(r.getUserId())
                        .fullName(r.getFullName())
                        .phoneNumber(r.getPhoneNumber())
                        .riderStatus(r.getRiderStatus())
                        .build())
                .collect(Collectors.toList());
    }


    // =========================
    // UPDATE RIDER AVAILABILITY
    // =========================

    @Transactional
    public void updateRiderAvailability(
            Long riderId,
            RiderStatus status) {

        User rider = userRepository.findById(riderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Rider not found"));

        rider.setRiderStatus(status);

        userRepository.save(rider);
    }


    // =========================
    // MY ASSIGNED DELIVERIES
    // =========================

    @Transactional(readOnly = true)
    public List<DeliveryTaskResponse> getRiderAssignedTasks(
            Long riderId) {

        List<Delivery> deliveries =
                deliveryRepository
                        .findByRider_UserIdOrderByAssignedAtDesc(riderId);

        return deliveries.stream()
                .filter(d ->
                        d.getStatus() != DeliveryStatus.DELIVERED)
                .map(this::mapToDeliveryTaskResponse)
                .collect(Collectors.toList());
    }


    // =========================
    // DELIVERY HISTORY
    // =========================

    @Transactional(readOnly = true)
    public List<DeliveryTaskResponse> getRiderHistory(
            Long riderId) {

        List<Delivery> deliveries =
                deliveryRepository
                        .findByRider_UserIdOrderByAssignedAtDesc(riderId);

        return deliveries.stream()
                .filter(d ->
                        d.getStatus() == DeliveryStatus.DELIVERED)
                .map(this::mapToDeliveryTaskResponse)
                .collect(Collectors.toList());
    }


    // =========================
    // ACCEPT DELIVERY
    // =========================

    @Transactional
    public DeliveryTaskResponse acceptDelivery(
            Long deliveryId,
            Long riderId) {

        Delivery delivery = deliveryRepository
                .findById(deliveryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Delivery task not found"));

        // Only assigned rider can accept
        if (!delivery.getRider()
                .getUserId()
                .equals(riderId)) {

            throw new BadRequestException(
                    "You are not the assigned rider for this delivery");
        }

        // Delivery must be ASSIGNED before accepting
        if (delivery.getStatus() != DeliveryStatus.ASSIGNED) {

            throw new BadRequestException(
                    "Delivery can only be accepted when it is assigned");
        }

        delivery.setStatus(DeliveryStatus.ACCEPTED);
        delivery.setAcceptedAt(LocalDateTime.now());

        // Rider becomes BUSY
        User rider = delivery.getRider();

        rider.setRiderStatus(RiderStatus.BUSY);

        userRepository.save(rider);

        return mapToDeliveryTaskResponse(
                deliveryRepository.save(delivery));
    }


    // =========================
    // OUT FOR DELIVERY
    // =========================

    @Transactional
    public DeliveryTaskResponse markOutForDelivery(
            Long deliveryId,
            Long riderId) {

        Delivery delivery = deliveryRepository
                .findById(deliveryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Delivery task not found"));

        // Only assigned rider can update
        if (!delivery.getRider()
                .getUserId()
                .equals(riderId)) {

            throw new BadRequestException(
                    "You are not assigned to this delivery");
        }

        // Must be ACCEPTED first
        if (delivery.getStatus() != DeliveryStatus.ACCEPTED) {

            throw new BadRequestException(
                    "Delivery must be accepted before marking out for delivery");
        }

        delivery.setStatus(
                DeliveryStatus.OUT_FOR_DELIVERY);

        delivery.setOutForDeliveryAt(
                LocalDateTime.now());

        // Update order status
        Order order = delivery.getOrder();

        order.setStatus(
                OrderStatus.OUT_FOR_DELIVERY);

        orderRepository.save(order);

        return mapToDeliveryTaskResponse(
                deliveryRepository.save(delivery));
    }


    // =========================
    // DELIVERED
    // =========================

    @Transactional
    public DeliveryTaskResponse markDelivered(
            Long deliveryId,
            Long riderId) {

        Delivery delivery = deliveryRepository
                .findById(deliveryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Delivery task not found"));

        // Only assigned rider can update
        if (!delivery.getRider()
                .getUserId()
                .equals(riderId)) {

            throw new BadRequestException(
                    "You are not assigned to this delivery");
        }

        // Must be OUT_FOR_DELIVERY first
        if (delivery.getStatus()
                != DeliveryStatus.OUT_FOR_DELIVERY) {

            throw new BadRequestException(
                    "Delivery must be out for delivery before marking delivered");
        }

        delivery.setStatus(
                DeliveryStatus.DELIVERED);

        delivery.setDeliveredAt(
                LocalDateTime.now());

        // Update order status
        Order order = delivery.getOrder();

        order.setStatus(
                OrderStatus.DELIVERED);

        orderRepository.save(order);

        // Rider becomes AVAILABLE again
        User rider = delivery.getRider();

        rider.setRiderStatus(
                RiderStatus.AVAILABLE);

        userRepository.save(rider);

        return mapToDeliveryTaskResponse(
                deliveryRepository.save(delivery));
    }


    // =========================
    // DELETE / CANCEL DELIVERY
    // =========================

    @Transactional
    public void deleteDelivery(
            Long deliveryId,
            Long riderId) {

        Delivery delivery = deliveryRepository
                .findById(deliveryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Delivery task not found"));

        // Only the assigned rider can cancel the delivery
        if (!delivery.getRider()
                .getUserId()
                .equals(riderId)) {

            throw new BadRequestException(
                    "You are not assigned to this delivery");
        }

        // Only ASSIGNED deliveries can be cancelled
        if (delivery.getStatus()
                != DeliveryStatus.ASSIGNED) {

            throw new BadRequestException(
                    "Only assigned deliveries can be cancelled");
        }

        // Delete the delivery record
        deliveryRepository.delete(delivery);
    }


    // =========================
    // RESPONSE MAPPER
    // =========================

    private DeliveryTaskResponse mapToDeliveryTaskResponse(
            Delivery delivery) {

        Order order = delivery.getOrder();

        String addressText =
                "Pickup / Not Available";

        if (order.getDeliveryAddress() != null) {

            addressText =
                    order.getDeliveryAddress()
                            .getHouseNumber()
                            + ", "
                            + order.getDeliveryAddress()
                            .getStreet()
                            + " ("
                            + order.getDeliveryAddress()
                            .getDeliveryArea()
                            .getAreaName()
                            + ")";
        }

        return DeliveryTaskResponse.builder()

                .deliveryId(
                        delivery.getDeliveryId())

                .orderId(
                        order.getOrderId())

                .orderNumber(
                        order.getOrderNumber())

                .riderId(
                        delivery.getRider()
                                .getUserId())

                .riderName(
                        delivery.getRider()
                                .getFullName())

                .riderPhone(
                        delivery.getRider()
                                .getPhoneNumber())

                .deliveryStatus(
                        delivery.getStatus())

                .customerName(
                        order.getCustomer()
                                .getFullName())

                .customerPhone(
                        order.getCustomer()
                                .getPhoneNumber())

                .deliveryAddress(
                        addressText)

                .branchName(
                        order.getBranch()
                                .getBranchName())

                .assignedAt(
                        delivery.getAssignedAt())

                .acceptedAt(
                        delivery.getAcceptedAt())

                .outForDeliveryAt(
                        delivery.getOutForDeliveryAt())

                .deliveredAt(
                        delivery.getDeliveredAt())

                .orderDetails(
                        customerOrderingService
                                .mapToOrderResponse(order)
                )

                .build();
    }
}