package com.spiceavenue.delivery.entity;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.ordering.entity.Order;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_id")
    private Long deliveryId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false)
    private User rider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DeliveryStatus status = DeliveryStatus.ASSIGNED;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "out_for_delivery_at")
    private LocalDateTime outForDeliveryAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    public enum DeliveryStatus {
        ASSIGNED,
        ACCEPTED,
        OUT_FOR_DELIVERY,
        DELIVERED
    }
}