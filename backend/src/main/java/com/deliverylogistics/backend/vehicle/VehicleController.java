
package com.deliverylogistics.backend.vehicle;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Long id) {
        return vehicleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createVehicle(@RequestBody Vehicle vehicle) {
        if (vehicle.getRegistrationNumber() == null
                || vehicle.getRegistrationNumber().isBlank()
                || vehicle.getVehicleType() == null
                || vehicle.getVehicleType().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            "Registration number and vehicle type are required."));
        }

        if (vehicleRepository.findByRegistrationNumber(
                vehicle.getRegistrationNumber()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Registration number already exists."));
        }

        vehicle.setStatus("AVAILABLE");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vehicleRepository.save(vehicle));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(
            @PathVariable Long id,
            @RequestBody Vehicle updatedVehicle) {

        return vehicleRepository.findById(id)
                .map(vehicle -> {
                    if (updatedVehicle.getRegistrationNumber() == null
                            || updatedVehicle.getRegistrationNumber().isBlank()
                            || updatedVehicle.getVehicleType() == null
                            || updatedVehicle.getVehicleType().isBlank()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error",
                                        "Registration number and vehicle type are required."));
                    }

                    boolean registrationUsed =
                            vehicleRepository.findByRegistrationNumber(
                                    updatedVehicle.getRegistrationNumber())
                                    .filter(existing -> !existing.getId().equals(id))
                                    .isPresent();

                    if (registrationUsed) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of("error",
                                        "Registration number already exists."));
                    }

                    vehicle.setRegistrationNumber(
                            updatedVehicle.getRegistrationNumber());
                    vehicle.setVehicleType(updatedVehicle.getVehicleType());
                    vehicle.setMake(updatedVehicle.getMake());
                    vehicle.setModel(updatedVehicle.getModel());

                    if (updatedVehicle.getStatus() != null
                            && List.of("AVAILABLE", "IN_USE", "MAINTENANCE")
                            .contains(updatedVehicle.getStatus())) {
                        vehicle.setStatus(updatedVehicle.getStatus());
                    }

                    return ResponseEntity.ok(vehicleRepository.save(vehicle));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        if (!vehicleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        vehicleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
