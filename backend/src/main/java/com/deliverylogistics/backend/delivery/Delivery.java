
package com.deliverylogistics.backend.delivery;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String trackingNumber;

    @Column(nullable = false)
    private String recipientName;

    @Column(nullable = false)
    private String deliveryAddress;

    @Column(nullable = false)
    private String status = "PENDING";

    private LocalDateTime createdAt = LocalDateTime.now();

    private String receivedBy;

    private String deliveryNotes;

    private LocalDateTime deliveredAt;

    public Delivery() {
    }

    public Long getId() {
        return id;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public String getReceivedBy() {
    return receivedBy;
}

public void setReceivedBy(String receivedBy) {
    this.receivedBy = receivedBy;
}

public String getDeliveryNotes() {
    return deliveryNotes;
}

public void setDeliveryNotes(String deliveryNotes) {
    this.deliveryNotes = deliveryNotes;
}

public LocalDateTime getDeliveredAt() {
    return deliveredAt;
}

public void setDeliveredAt(LocalDateTime deliveredAt) {
    this.deliveredAt = deliveredAt;
}
}