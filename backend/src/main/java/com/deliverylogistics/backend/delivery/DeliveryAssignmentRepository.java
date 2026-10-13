
package com.deliverylogistics.backend.delivery;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryAssignmentRepository
        extends JpaRepository<DeliveryAssignment, Long> {
}
