
const API_BASE_URL = 'http://localhost:8080/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export interface Delivery {
  id: number
  trackingNumber: string
  recipientName: string
  deliveryAddress: string
  status: string
  createdAt?: string
  receivedBy?: string
  deliveryNotes?: string
  deliveredAt?: string
}

export interface Driver {
  id: number
  fullName: string
  email: string
  phoneNumber?: string
  licenseNumber: string
  status: string
}

export interface Vehicle {
  id: number
  registrationNumber: string
  vehicleType: string
  make?: string
  model?: string
  status: string
}

export interface Assignment {
  id: number
  delivery: Delivery
  driver: Driver
  vehicle: Vehicle
  assignedAt?: string
}

export const api = {
  getDeliveries: () => request<Delivery[]>('/deliveries'),
  getDrivers: () => request<Driver[]>('/drivers'),
  getVehicles: () => request<Vehicle[]>('/vehicles'),
  getAssignments: () => request<Assignment[]>('/assignments'),


createAssignment: (assignment: {
  deliveryId: number;
  driverId: number;
  vehicleId: number;
}) =>
  request<Assignment>('/assignments', {
    method: 'POST',
    body: JSON.stringify(assignment),
  }),


  
recordProofOfDelivery: (
  assignmentId: number,
  proof: {
    receivedBy: string;
    deliveryNotes?: string;
  }
) =>
  request<Assignment>(
    `/assignments/${assignmentId}/proof-of-delivery`,
    {
      method: 'POST',
      body: JSON.stringify(proof),
    }
  ),



  createDelivery: (delivery: {
    trackingNumber: string
    recipientName: string
    deliveryAddress: string
  }) =>
    request<Delivery>('/deliveries', {
      method: 'POST',
      body: JSON.stringify(delivery),
    }),

    
updateDriver: (
  id: number,
  driver: {
    fullName: string;
    email: string;
    phoneNumber: string;
    licenseNumber: string;
    status: string;
  }
) =>
  request<Driver>(`/drivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(driver),
  }),

deleteDriver: (id: number) =>
  request<void>(`/drivers/${id}`, {
    method: 'DELETE',
  }),


    updateDeliveryStatus: (id: number, status: string) =>
  request<Delivery>(`/deliveries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),

  deleteDelivery: (id: number) =>
  request<void>(`/deliveries/${id}`, {
    method: 'DELETE',
  }),

  createDriver: (driver: {
  fullName: string
  email: string
  phoneNumber: string
  licenseNumber: string
}) =>
  request<Driver>('/drivers', {
    method: 'POST',
    body: JSON.stringify(driver),
  }),

  
updateVehicle: (
  id: number,
  vehicle: {
    registrationNumber: string;
    vehicleType: string;
    make: string;
    model: string;
    status: string;
  }
) =>
  request<Vehicle>(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vehicle),
  }),

deleteVehicle: (id: number) =>
  request<void>(`/vehicles/${id}`, {
    method: 'DELETE',
  }),


createVehicle: (vehicle: {
  registrationNumber: string
  vehicleType: string
  make: string
  model: string
}) =>
  request<Vehicle>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicle),
  }),

}
