
package com.deliverylogistics.backend.driver;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverRepository driverRepository;

    public DriverController(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriverById(@PathVariable Long id) {
        return driverRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createDriver(@RequestBody Driver driver) {
        if (driver.getFullName() == null || driver.getFullName().isBlank()
                || driver.getEmail() == null || driver.getEmail().isBlank()
                || driver.getLicenseNumber() == null
                || driver.getLicenseNumber().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            "Full name, email, and license number are required."));
        }

        if (driverRepository.findByEmail(driver.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already exists."));
        }

        if (driverRepository.findByLicenseNumber(driver.getLicenseNumber()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "License number already exists."));
        }

        driver.setStatus("AVAILABLE");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(driverRepository.save(driver));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDriver(
            @PathVariable Long id,
            @RequestBody Driver updatedDriver) {

        return driverRepository.findById(id)
                .map(driver -> {
                    if (updatedDriver.getFullName() == null
                            || updatedDriver.getFullName().isBlank()
                            || updatedDriver.getEmail() == null
                            || updatedDriver.getEmail().isBlank()
                            || updatedDriver.getLicenseNumber() == null
                            || updatedDriver.getLicenseNumber().isBlank()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error",
                                        "Full name, email, and license number are required."));
                    }

                    boolean emailUsed = driverRepository.findByEmail(updatedDriver.getEmail())
                            .filter(existing -> !existing.getId().equals(id))
                            .isPresent();

                    boolean licenseUsed = driverRepository
                            .findByLicenseNumber(updatedDriver.getLicenseNumber())
                            .filter(existing -> !existing.getId().equals(id))
                            .isPresent();

                    if (emailUsed || licenseUsed) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(Map.of("error",
                                        "Email or license number already exists."));
                    }

                    driver.setFullName(updatedDriver.getFullName());
                    driver.setEmail(updatedDriver.getEmail());
                    driver.setPhoneNumber(updatedDriver.getPhoneNumber());
                    driver.setLicenseNumber(updatedDriver.getLicenseNumber());

                    if (updatedDriver.getStatus() != null
                            && List.of("AVAILABLE", "ON_DELIVERY", "UNAVAILABLE")
                            .contains(updatedDriver.getStatus())) {
                        driver.setStatus(updatedDriver.getStatus());
                    }

                    return ResponseEntity.ok(driverRepository.save(driver));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        if (!driverRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        driverRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
