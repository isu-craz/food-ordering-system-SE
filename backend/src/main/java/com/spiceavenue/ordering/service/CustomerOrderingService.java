package com.spiceavenue.ordering.service;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import com.spiceavenue.branch.entity.Branch;
import com.spiceavenue.branch.entity.DeliveryArea;
import com.spiceavenue.branch.repository.BranchRepository;
import com.spiceavenue.branch.repository.DeliveryAreaRepository;
import com.spiceavenue.common.enums.EntityStatus;
import com.spiceavenue.common.enums.OrderStatus;
import com.spiceavenue.common.enums.OrderType;
import com.spiceavenue.common.exception.BadRequestException;
import com.spiceavenue.common.exception.ResourceNotFoundException;
import com.spiceavenue.menu.entity.MenuItem;
import com.spiceavenue.menu.entity.MenuVariation;
import com.spiceavenue.menu.repository.MenuItemRepository;
import com.spiceavenue.menu.repository.MenuVariationRepository;
import com.spiceavenue.ordering.dto.OrderingDtos.*;
import com.spiceavenue.ordering.entity.CustomerAddress;
import com.spiceavenue.ordering.entity.Order;
import com.spiceavenue.ordering.entity.OrderItem;
import com.spiceavenue.ordering.repository.CustomerAddressRepository;
import com.spiceavenue.ordering.repository.OrderItemRepository;
import com.spiceavenue.ordering.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerOrderingService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerAddressRepository addressRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuVariationRepository menuVariationRepository;
    private final DeliveryAreaRepository deliveryAreaRepository;


    // =========================================================
    // CUSTOMER ADDRESSES
    // =========================================================

    @Transactional(readOnly = true)
    public List<AddressResponse> getCustomerAddresses(Long customerId) {

        return addressRepository.findByCustomer_UserId(customerId)
                .stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }


    @Transactional
    public AddressResponse addCustomerAddress(
            Long customerId,
            CreateAddressRequest request) {

        User customer = userRepository.findById(customerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));

        DeliveryArea area = deliveryAreaRepository.findById(request.getAreaId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Delivery area not found"));

        CustomerAddress address = CustomerAddress.builder()
                .customer(customer)
                .label(
                        request.getLabel() != null &&
                                !request.getLabel().isBlank()
                                ? request.getLabel()
                                : "Home"
                )
                .houseNumber(request.getHouseNumber())
                .street(request.getStreet())
                .deliveryArea(area)
                .isDefault(request.isDefault())
                .build();

        return mapToAddressResponse(
                addressRepository.save(address)
        );
    }


    @Transactional
    public void deleteCustomerAddress(
            Long addressId,
            Long customerId) {

        CustomerAddress address = addressRepository.findById(addressId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Address not found"));

        if (!address.getCustomer().getUserId().equals(customerId)) {
            throw new BadRequestException(
                    "You do not own this address"
            );
        }

        addressRepository.delete(address);
    }


    // =========================================================
    // PLACE ORDER
    // =========================================================

    @Transactional
    public OrderResponse placeOrder(
            Long customerId,
            PlaceOrderRequest request) {

        User customer = userRepository.findById(customerId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Customer not found"));

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Branch not found"));


        // -----------------------------------------------------
        // Check branch status
        // -----------------------------------------------------

        if (branch.getStatus() != EntityStatus.ACTIVE) {

            throw new BadRequestException(
                    "This branch is currently inactive and cannot accept orders"
            );
        }


        // -----------------------------------------------------
        // Delivery address
        // -----------------------------------------------------

        CustomerAddress deliveryAddress = null;

        BigDecimal deliveryFee = BigDecimal.ZERO;


        if (request.getOrderType() == OrderType.DELIVERY) {

            if (request.getDeliveryAddressId() == null) {

                throw new BadRequestException(
                        "Delivery address is required for delivery orders"
                );
            }


            deliveryAddress = addressRepository
                    .findById(request.getDeliveryAddressId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Delivery address not found"
                            ));


            // -------------------------------------------------
            // Verify delivery area belongs to selected branch
            // -------------------------------------------------

            if (!deliveryAddress
                    .getDeliveryArea()
                    .getBranch()
                    .getBranchId()
                    .equals(branch.getBranchId())) {

                throw new BadRequestException(
                        "Delivery address area is outside this branch's coverage"
                );
            }


            deliveryFee =
                    deliveryAddress
                            .getDeliveryArea()
                            .getDeliveryFee();
        }


        // -----------------------------------------------------
        // Calculate subtotal
        // -----------------------------------------------------

        BigDecimal subtotal = BigDecimal.ZERO;

        List<OrderItem> orderItems = new ArrayList<>();


        // -----------------------------------------------------
        // Create order
        // -----------------------------------------------------

        Order order = Order.builder()
                .orderNumber(
                        "ORD-" +
                                LocalDateTime.now()
                                        .format(
                                                DateTimeFormatter.ofPattern(
                                                        "yyyyMMdd"
                                                )
                                        ) +
                                "-" +
                                UUID.randomUUID()
                                        .toString()
                                        .substring(0, 6)
                                        .toUpperCase()
                )
                .customer(customer)
                .branch(branch)
                .orderType(request.getOrderType())
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .deliveryAddress(deliveryAddress)
                .deliveryFee(deliveryFee)
                .subtotal(BigDecimal.ZERO)
                .totalAmount(BigDecimal.ZERO)
                .build();


        order = orderRepository.save(order);


        // -----------------------------------------------------
        // Create order items
        // -----------------------------------------------------

        for (CartItemRequest itemReq : request.getItems()) {

            MenuItem menuItem =
                    menuItemRepository.findById(itemReq.getItemId())
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Menu item not found: " +
                                                    itemReq.getItemId()
                                    )
                            );


            // -------------------------------------------------
            // Check menu item availability
            // -------------------------------------------------

            if (!menuItem.isAvailable() ||
                    menuItem.getStatus() != EntityStatus.ACTIVE) {

                throw new BadRequestException(
                        "Item '" +
                                menuItem.getFoodName() +
                                "' is currently Out of Stock"
                );
            }


            // -------------------------------------------------
            // Unit price
            // -------------------------------------------------

            BigDecimal unitPrice =
                    menuItem.getBasePrice();

            MenuVariation variation = null;

            String variationName = null;


            // -------------------------------------------------
            // Variation
            // -------------------------------------------------

            if (itemReq.getVariationId() != null) {

                variation =
                        menuVariationRepository
                                .findById(
                                        itemReq.getVariationId()
                                )
                                .orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Variation not found: " +
                                                        itemReq.getVariationId()
                                        )
                                );


                unitPrice =
                        unitPrice.add(
                                variation.getAdditionalPrice()
                        );

                variationName =
                        variation.getVariationName();
            }


            // -------------------------------------------------
            // Line total
            // -------------------------------------------------

            BigDecimal lineTotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    itemReq.getQuantity()
                            )
                    );


            subtotal =
                    subtotal.add(lineTotal);


            // -------------------------------------------------
            // Create order item
            // -------------------------------------------------

            OrderItem orderItem =
                    OrderItem.builder()
                            .order(order)
                            .menuItem(menuItem)
                            .variation(variation)
                            .itemName(menuItem.getFoodName())
                            .variationName(variationName)
                            .quantity(itemReq.getQuantity())
                            .unitPrice(unitPrice)
                            .totalPrice(lineTotal)
                            .build();


            orderItems.add(orderItem);
        }


        // -----------------------------------------------------
        // Save order items
        // -----------------------------------------------------

        orderItemRepository.saveAll(orderItems);


        order.setOrderItems(orderItems);

        order.setSubtotal(subtotal);

        order.setTotalAmount(
                subtotal.add(deliveryFee)
        );


        return mapToOrderResponse(
                orderRepository.save(order)
        );
    }


    // =========================================================
    // CUSTOMER ORDER HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getCustomerOrderHistory(
            Long customerId) {

        return orderRepository
                .findByCustomer_UserIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // TRACK ORDER
    // =========================================================

    @Transactional(readOnly = true)
    public OrderResponse trackOrder(
            Long orderId,
            Long customerId) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found with ID: " +
                                                orderId
                                )
                        );


        // -----------------------------------------------------
        // Ownership check
        // -----------------------------------------------------

        if (!order
                .getCustomer()
                .getUserId()
                .equals(customerId)) {

            throw new BadRequestException(
                    "You can only track your own orders"
            );
        }


        return mapToOrderResponse(order);
    }


    // =========================================================
    // CANCEL ORDER
    // =========================================================

    @Transactional
    public OrderResponse cancelOrder(
            Long orderId,
            Long customerId,
            CancelOrderRequest request) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order not found"
                                )
                        );


        // -----------------------------------------------------
        // Ownership check
        // -----------------------------------------------------

        if (!order
                .getCustomer()
                .getUserId()
                .equals(customerId)) {

            throw new BadRequestException(
                    "You can only cancel your own orders"
            );
        }


        // -----------------------------------------------------
        // Cancellation rules
        // -----------------------------------------------------

        if (order.getStatus() != OrderStatus.PENDING &&
                order.getStatus() != OrderStatus.CONFIRMED) {

            throw new BadRequestException(
                    "Cannot cancel order: Preparation has already started (" +
                            order.getStatus() +
                            ")"
            );
        }


        order.setStatus(OrderStatus.CANCELLED);


        order.setCancellationReason(
                request.getCancellationReason() != null
                        ? request.getCancellationReason()
                        : "Cancelled by Customer"
        );


        return mapToOrderResponse(
                orderRepository.save(order)
        );
    }


    // =========================================================
    // MAP ORDER -> RESPONSE
    // =========================================================

    public OrderResponse mapToOrderResponse(
            Order order) {

        // -----------------------------------------------------
        // Order items
        // -----------------------------------------------------

        List<OrderItemResponse> items =
                order.getOrderItems() != null
                        ?
                        order.getOrderItems()
                                .stream()
                                .map(item ->
                                        OrderItemResponse.builder()
                                                .orderItemId(
                                                        item.getOrderItemId()
                                                )
                                                .itemId(
                                                        item.getMenuItem()
                                                                .getItemId()
                                                )
                                                .itemName(
                                                        item.getItemName()
                                                )
                                                .variationId(
                                                        item.getVariation() != null
                                                                ?
                                                                item.getVariation()
                                                                        .getVariationId()
                                                                :
                                                                null
                                                )
                                                .variationName(
                                                        item.getVariationName()
                                                )
                                                .quantity(
                                                        item.getQuantity()
                                                )
                                                .unitPrice(
                                                        item.getUnitPrice()
                                                )
                                                .totalPrice(
                                                        item.getTotalPrice()
                                                )
                                                .build()
                                )
                                .collect(Collectors.toList())
                        :
                        List.of();


        // -----------------------------------------------------
        // Delivery address
        // -----------------------------------------------------

        String addressText = null;


        if (order.getDeliveryAddress() != null) {

            CustomerAddress addr =
                    order.getDeliveryAddress();


            addressText =
                    addr.getHouseNumber() +
                            ", " +
                            addr.getStreet() +
                            " (" +
                            addr.getDeliveryArea().getAreaName() +
                            ")";
        }


        // -----------------------------------------------------
        // Build response
        // -----------------------------------------------------

        return OrderResponse.builder()
                .orderId(
                        order.getOrderId()
                )
                .orderNumber(
                        order.getOrderNumber()
                )
                .customerId(
                        order.getCustomer().getUserId()
                )
                .customerName(
                        order.getCustomer().getFullName()
                )
                .customerPhone(
                        order.getCustomer().getPhoneNumber()
                )
                .branchId(
                        order.getBranch().getBranchId()
                )
                .branchName(
                        order.getBranch().getBranchName()
                )
                .orderType(
                        order.getOrderType()
                )
                .status(
                        order.getStatus()
                )
                .subtotal(
                        order.getSubtotal()
                )
                .deliveryFee(
                        order.getDeliveryFee()
                )
                .totalAmount(
                        order.getTotalAmount()
                )
                .paymentMethod(
                        order.getPaymentMethod()
                )
                .deliveryAddressText(
                        addressText
                )
                .estimatedPrepMinutes(
                        order.getEstimatedPrepMinutes()
                )
                .rejectionReason(
                        order.getRejectionReason()
                )
                .cancellationReason(
                        order.getCancellationReason()
                )
                .createdAt(
                        order.getCreatedAt()
                )
                .items(
                        items
                )
                .build();
    }


    // =========================================================
    // MAP ADDRESS -> RESPONSE
    // =========================================================

    private AddressResponse mapToAddressResponse(
            CustomerAddress address) {

        return AddressResponse.builder()
                .addressId(
                        address.getAddressId()
                )
                .label(
                        address.getLabel()
                )
                .houseNumber(
                        address.getHouseNumber()
                )
                .street(
                        address.getStreet()
                )
                .areaId(
                        address.getDeliveryArea().getAreaId()
                )
                .areaName(
                        address.getDeliveryArea().getAreaName()
                )
                .deliveryFee(
                        address.getDeliveryArea().getDeliveryFee()
                )
                .isDefault(
                        address.isDefault()
                )
                .build();
    }
}