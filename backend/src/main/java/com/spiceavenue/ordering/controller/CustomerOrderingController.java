package com.spiceavenue.ordering.controller;

import com.spiceavenue.common.dto.ApiResponse;
import com.spiceavenue.ordering.dto.OrderingDtos.*;
import com.spiceavenue.ordering.service.CustomerOrderingService;
import com.spiceavenue.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@Tag(name = "Member 3 - Customer Ordering", description = "Endpoints for saved addresses, cart checkout, order tracking, and history")
public class CustomerOrderingController {

    private final CustomerOrderingService orderingService;

    // Addresses
    @GetMapping("/addresses")
    @Operation(summary = "Get current customer's saved delivery addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses(@AuthenticationPrincipal UserDetailsImpl user) {
        List<AddressResponse> addresses = orderingService.getCustomerAddresses(user.getId());
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping("/addresses")
    @Operation(summary = "Save a new delivery address")
    public ResponseEntity<ApiResponse<AddressResponse>> addAddress(
            @AuthenticationPrincipal UserDetailsImpl user, @Valid @RequestBody CreateAddressRequest request) {
        AddressResponse address = orderingService.addCustomerAddress(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Address saved successfully", address));
    }

    @DeleteMapping("/addresses/{id}")
    @Operation(summary = "Delete a saved delivery address")
    public ResponseEntity<ApiResponse<String>> deleteAddress(
            @AuthenticationPrincipal UserDetailsImpl user, @PathVariable Long id) {
        orderingService.deleteCustomerAddress(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }

    // Orders
    @PostMapping("/orders")
    @Operation(summary = "Place a new customer order (Pickup or Delivery)")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal UserDetailsImpl user, @Valid @RequestBody PlaceOrderRequest request) {
        OrderResponse order = orderingService.placeOrder(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully! Status: PENDING", order));
    }

    @GetMapping("/orders")
    @Operation(summary = "Get current customer's order history")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderHistory(@AuthenticationPrincipal UserDetailsImpl user) {
        List<OrderResponse> orders = orderingService.getCustomerOrderHistory(user.getId());
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/orders/{id}/track")
    @Operation(summary = "Track status progression for a specific customer order")
    public ResponseEntity<ApiResponse<OrderResponse>> trackOrder(
            @AuthenticationPrincipal UserDetailsImpl user, @PathVariable Long id) {
        OrderResponse order = orderingService.trackOrder(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PatchMapping("/orders/{id}/cancel")
    @Operation(summary = "Cancel customer order (Allowed only when PENDING or CONFIRMED)")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long id,
            @RequestBody(required = false) CancelOrderRequest request) {
        OrderResponse order = orderingService.cancelOrder(id, user.getId(), request != null ? request : new CancelOrderRequest());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }
    @PatchMapping("/orders/{id}/address")
    @Operation(summary = "Update delivery address for customer order (Allowed within 15 minutes of placement)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateAddress(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long id,
            @RequestParam Long newAddressId) {
        OrderResponse order = orderingService.updateOrderAddress(id, user.getId(), newAddressId);
        return ResponseEntity.ok(ApiResponse.success("Delivery address updated successfully", order));
    }

}
