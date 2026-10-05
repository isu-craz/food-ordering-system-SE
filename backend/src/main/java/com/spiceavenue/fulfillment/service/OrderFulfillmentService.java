package com.spiceavenue.fulfillment.service;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import com.spiceavenue.common.enums.OrderStatus;
import com.spiceavenue.common.enums.OrderType;
import com.spiceavenue.common.enums.RiderStatus;
import com.spiceavenue.common.enums.UserRole;
import com.spiceavenue.common.exception.BadRequestException;
import com.spiceavenue.common.exception.ResourceNotFoundException;
import com.spiceavenue.delivery.entity.Delivery;
import com.spiceavenue.delivery.repository.DeliveryRepository;
import com.spiceavenue.fulfillment.dto.FulfillmentDtos.*;
import com.spiceavenue.ordering.dto.OrderingDtos.OrderResponse;
import com.spiceavenue.ordering.entity.Order;
import com.spiceavenue.ordering.repository.OrderRepository;
import com.spiceavenue.ordering.service.CustomerOrderingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderFulfillmentService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;
    private final CustomerOrderingService customerOrderingService;


    // =========================================================
    // GET INCOMING ORDERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getIncomingOrders(
            Long branchId,
            OrderStatus status) {

        List<Order> orders = status != null
                ? orderRepository.findByBranch_BranchIdAndStatusOrderByCreatedAtAsc(
                branchId,
                status)
                : orderRepository.findByBranch_BranchIdOrderByCreatedAtDesc(
                branchId);

        return orders.stream()
                .map(customerOrderingService::mapToOrderResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // CONFIRM ORDER
    // =========================================================

    @Transactional
    public OrderResponse confirmOrder(
            Long orderId,
            ConfirmOrderRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with ID: " + orderId));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING orders can be confirmed. Current status: "
                            + order.getStatus());
        }

        order.setStatus(OrderStatus.CONFIRMED);

        order.setEstimatedPrepMinutes(
                request.getEstimatedPrepMinutes());

        Order savedOrder = orderRepository.save(order);

        return customerOrderingService.mapToOrderResponse(savedOrder);
    }


    // =========================================================
    // REJECT ORDER
    // =========================================================

    @Transactional
    public OrderResponse rejectOrder(
            Long orderId,
            RejectOrderRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING orders can be rejected");
        }

        order.setStatus(OrderStatus.REJECTED);

        order.setRejectionReason(
                request.getReason());

        Order savedOrder = orderRepository.save(order);

        return customerOrderingService.mapToOrderResponse(savedOrder);
    }


    // =========================================================
    // MARK AS PREPARING
    // =========================================================

    @Transactional
    public OrderResponse markAsPreparing(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException(
                    "Order must be CONFIRMED before starting preparation");
        }

        order.setStatus(OrderStatus.PREPARING);

        Order savedOrder = orderRepository.save(order);

        return customerOrderingService.mapToOrderResponse(savedOrder);
    }


    // =========================================================
    // MARK READY FOR PICKUP
    // =========================================================

    @Transactional
    public OrderResponse markReadyForPickup(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        if (order.getOrderType() != OrderType.PICKUP) {
            throw new BadRequestException(
                    "This action is only valid for PICKUP orders");
        }

        if (order.getStatus() != OrderStatus.PREPARING) {
            throw new BadRequestException(
                    "Order must be in PREPARING status");
        }

        order.setStatus(OrderStatus.READY_FOR_PICKUP);

        Order savedOrder = orderRepository.save(order);

        return customerOrderingService.mapToOrderResponse(savedOrder);
    }


    // =========================================================
    // MARK PICKED UP
    // =========================================================

    @Transactional
    public OrderResponse markPickedUp(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        if (order.getStatus() != OrderStatus.READY_FOR_PICKUP) {
            throw new BadRequestException(
                    "Order must be READY_FOR_PICKUP before marking as PICKED_UP");
        }

        order.setStatus(OrderStatus.PICKED_UP);

        Order savedOrder = orderRepository.save(order);

        return customerOrderingService.mapToOrderResponse(savedOrder);
    }


    // =========================================================
    // MARK READY FOR DELIVERY
    // =========================================================

    @Transactional
    public OrderResponse markReadyForDelivery(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        if (order.getOrderType() != OrderType.DELIVERY) {
            throw new BadRequestException(
                    "This action is only valid for DELIVERY orders");
        }

        if (order.getStatus() != OrderStatus.PREPARING) {
            throw new BadRequestException(
                    "Order must be in PREPARING status");
        }

        order.setStatus(OrderStatus.READY_FOR_DELIVERY);

        Order savedOrder = orderRepository.save(order);

        return customerOrderingService.mapToOrderResponse(savedOrder);
    }


    // =========================================================
    // ASSIGN DELIVERY RIDER
    // =========================================================

    @Transactional
    public OrderResponse assignDeliveryRider(
            Long orderId,
            AssignRiderRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found"));

        // Check order type
        if (order.getOrderType() != OrderType.DELIVERY) {
            throw new BadRequestException(
                    "Only delivery orders can have riders assigned");
        }

        // Check rider exists
        User rider = userRepository.findById(
                        request.getRiderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Rider not found"));

        // Check rider role
        if (rider.getRole() != UserRole.RIDER) {
            throw new BadRequestException(
                    "Selected user is not a registered delivery rider");
        }

        // Check rider availability
        if (rider.getRiderStatus() != RiderStatus.AVAILABLE) {
            throw new BadRequestException(
                    "Rider is currently "
                            + rider.getRiderStatus()
                            + " and cannot receive new assignments");
        }

        // Find existing delivery or create new one
        Delivery delivery =
                deliveryRepository.findByOrder_OrderId(orderId)
                        .orElse(
                                Delivery.builder()
                                        .order(order)
                                        .build()
                        );

        // Assign rider
        delivery.setRider(rider);

        // Initial delivery status
        delivery.setStatus(
                Delivery.DeliveryStatus.ASSIGNED);

        deliveryRepository.save(delivery);


        /*
         * IMPORTANT:
         *
         * Do NOT change rider to BUSY here.
         *
         * According to the delivery workflow,
         * rider becomes BUSY when the rider ACCEPTS
         * the delivery.
         *
         * DeliveryService.acceptDelivery()
         * handles:
         *
         * AVAILABLE -> BUSY
         */

        return customerOrderingService.mapToOrderResponse(order);
    }
}