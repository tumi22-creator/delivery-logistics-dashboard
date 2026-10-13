package com.deliverylogistics.backend.delivery;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryRepository deliveryRepository;

    public DeliveryController(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }

    @GetMapping
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    @GetMapping("/{id}")
    public Delivery getDeliveryById(@PathVariable Long id) {
        return deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Delivery not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Delivery createDelivery(@RequestBody Delivery delivery) {
        if (delivery.getTrackingNumber() == null ||
                delivery.getTrackingNumber().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Tracking number is required");
        }

        if (delivery.getRecipientName() == null ||
                delivery.getRecipientName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Recipient name is required");
        }

        if (delivery.getDeliveryAddress() == null ||
                delivery.getDeliveryAddress().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Delivery address is required");
        }

        if (deliveryRepository.findByTrackingNumber(
                delivery.getTrackingNumber()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Tracking number already exists");
        }

        delivery.setStatus("PENDING");
        return deliveryRepository.save(delivery);
    }

    @PatchMapping("/{id}/status")
    public Delivery updateDeliveryStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        List<String> allowedStatuses = List.of(
                "PENDING", "IN_TRANSIT", "OUT_FOR_DELIVERY",
                "DELIVERED", "FAILED", "RETURNED"
        );

        if (!allowedStatuses.contains(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid delivery status");
        }

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Delivery not found"));

        delivery.setStatus(status);
        return deliveryRepository.save(delivery);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDelivery(@PathVariable Long id) {
        if (!deliveryRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Delivery not found");
        }

        deliveryRepository.deleteById(id);
    }
}