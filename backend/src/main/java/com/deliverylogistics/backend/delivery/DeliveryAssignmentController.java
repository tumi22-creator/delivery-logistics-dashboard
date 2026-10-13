
package com.deliverylogistics.backend.delivery;

import com.deliverylogistics.backend.driver.Driver;
import com.deliverylogistics.backend.driver.DriverRepository;
import com.deliverylogistics.backend.vehicle.Vehicle;
import com.deliverylogistics.backend.vehicle.VehicleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
public class DeliveryAssignmentController {

    private final DeliveryAssignmentRepository assignmentRepository;
    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    public DeliveryAssignmentController(
            DeliveryAssignmentRepository assignmentRepository,
            DeliveryRepository deliveryRepository,
            DriverRepository driverRepository,
            VehicleRepository vehicleRepository) {
        this.assignmentRepository = assignmentRepository;
        this.deliveryRepository = deliveryRepository;
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public List<DeliveryAssignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createAssignment(
            @RequestBody Map<String, Long> request) {

        Long deliveryId = request.get("deliveryId");
        Long driverId = request.get("driverId");
        Long vehicleId = request.get("vehicleId");

        if (deliveryId == null || driverId == null || vehicleId == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "deliveryId, driverId, and vehicleId are required."));
        }

        var delivery = deliveryRepository.findById(deliveryId);
        var driver = driverRepository.findById(driverId);
        var vehicle = vehicleRepository.findById(vehicleId);

        if (delivery.isEmpty() || driver.isEmpty() || vehicle.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("error",
                            "Delivery, driver, or vehicle was not found."));
        }

        if (!"PENDING".equals(delivery.get().getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "Only PENDING deliveries can be assigned."));
        }

        if (!"AVAILABLE".equals(driver.get().getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Driver is not available."));
        }

        if (!"AVAILABLE".equals(vehicle.get().getStatus())) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Vehicle is not available."));
        }

        DeliveryAssignment assignment = new DeliveryAssignment();
        assignment.setDelivery(delivery.get());
        assignment.setDriver(driver.get());
        assignment.setVehicle(vehicle.get());

        delivery.get().setStatus("IN_TRANSIT");
        driver.get().setStatus("ON_DELIVERY");
        vehicle.get().setStatus("IN_USE");

        deliveryRepository.save(delivery.get());
        driverRepository.save(driver.get());
        vehicleRepository.save(vehicle.get());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentRepository.save(assignment));
    }

@PostMapping("/{id}/proof-of-delivery")
@Transactional
public ResponseEntity<?> confirmDelivery(
        @PathVariable Long id,
        @RequestBody Map<String, String> request) {

    var assignmentOptional = assignmentRepository.findById(id);

    if (assignmentOptional.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    DeliveryAssignment assignment = assignmentOptional.get();
    Delivery delivery = assignment.getDelivery();

    if (!"IN_TRANSIT".equals(delivery.getStatus())) {
        return ResponseEntity.badRequest().body(
                Map.of("error", "Only IN_TRANSIT deliveries can be completed."));
    }

    String receivedBy = request.get("receivedBy");

    if (receivedBy == null || receivedBy.isBlank()) {
        return ResponseEntity.badRequest().body(
                Map.of("error", "The recipient's name is required."));
    }

    delivery.setReceivedBy(receivedBy.trim());
    delivery.setDeliveryNotes(request.getOrDefault("deliveryNotes", ""));
    delivery.setDeliveredAt(LocalDateTime.now());
    delivery.setStatus("DELIVERED");

    assignment.getDriver().setStatus("AVAILABLE");
    assignment.getVehicle().setStatus("AVAILABLE");

    deliveryRepository.save(delivery);
    driverRepository.save(assignment.getDriver());
    vehicleRepository.save(assignment.getVehicle());

    return ResponseEntity.ok(Map.of(
            "message", "Delivery completed successfully.",
            "deliveryId", delivery.getId(),
            "trackingNumber", delivery.getTrackingNumber(),
            "status", delivery.getStatus(),
            "receivedBy", delivery.getReceivedBy(),
            "deliveryNotes", delivery.getDeliveryNotes(),
            "deliveredAt", delivery.getDeliveredAt().toString()
    ));
}

}
