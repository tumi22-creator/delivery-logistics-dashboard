
import { useCallback, useEffect, useState } from 'react'
import {
  api,
  type Delivery,
  type Driver,
  type Vehicle,
  type Assignment,
} from './api'
import './App.css'

type Page = 'Dashboard' | 'Deliveries' | 'Drivers' | 'Vehicles' | 'Assignments'

const DELIVERY_STATUSES = [
  'PENDING',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FAILED',
  'RETURNED',
] as const

function App() {
  const [activePage, setActivePage] = useState<Page>('Dashboard')
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('ALL')
  const [driverSearch, setDriverSearch] = useState('')
  const [driverStatusFilter, setDriverStatusFilter] = useState('ALL')
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState('ALL')
  const [assignmentSearch, setAssignmentSearch] = useState('')
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('ALL')

  // Delivery creation
  const [showDeliveryForm, setShowDeliveryForm] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  // Driver creation and editing
  const [showDriverForm, setShowDriverForm] = useState(false)
  const [driverFullName, setDriverFullName] = useState('')
  const [driverEmail, setDriverEmail] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [driverLicense, setDriverLicense] = useState('')
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null)
  const [editDriverName, setEditDriverName] = useState('')
  const [editDriverEmail, setEditDriverEmail] = useState('')
  const [editDriverPhone, setEditDriverPhone] = useState('')
  const [editDriverLicense, setEditDriverLicense] = useState('')
  const [editDriverStatus, setEditDriverStatus] = useState('AVAILABLE')

  // Vehicle creation and editing
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleRegistration, setVehicleRegistration] = useState('')
  const [vehicleType, setVehicleType] = useState('VAN')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null)
  const [editVehicleRegistration, setEditVehicleRegistration] = useState('')
  const [editVehicleType, setEditVehicleType] = useState('VAN')
  const [editVehicleMake, setEditVehicleMake] = useState('')
  const [editVehicleModel, setEditVehicleModel] = useState('')
  const [editVehicleStatus, setEditVehicleStatus] = useState('AVAILABLE')

  // Assignment creation
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [assignmentDeliveryId, setAssignmentDeliveryId] = useState('')
  const [assignmentDriverId, setAssignmentDriverId] = useState('')
  const [assignmentVehicleId, setAssignmentVehicleId] = useState('')

  // Proof of delivery
  const [showProofForm, setShowProofForm] = useState(false)
  const [proofAssignmentId, setProofAssignmentId] = useState('')
  const [proofReceivedBy, setProofReceivedBy] = useState('')
  const [proofDeliveryNotes, setProofDeliveryNotes] = useState('')

  const menuItems: Page[] = [
    'Dashboard',
    'Deliveries',
    'Drivers',
    'Vehicles',
    'Assignments',
  ]

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const [deliveryData, driverData, vehicleData, assignmentData] =
        await Promise.all([
          api.getDeliveries(),
          api.getDrivers(),
          api.getVehicles(),
          api.getAssignments(),
        ])

      setDeliveries(deliveryData)
      setDrivers(driverData)
      setVehicles(vehicleData)
      setAssignments(assignmentData)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the backend.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    void loadData()

    const interval = window.setInterval(() => {
      void loadData(true)
    }, 30000)

    return () => window.clearInterval(interval)
  }, [loadData])

  // Dashboard statistics
  const completedDeliveries = deliveries.filter(
    (delivery) => delivery.status === 'DELIVERED',
  ).length

  const activeDrivers = drivers.filter(
    (driver) => driver.status === 'ON_DELIVERY',
  ).length

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.status === 'AVAILABLE',
  ).length

  // Filtered data
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredDeliveries = deliveries
    .filter((delivery) => {
      const matchesSearch = [
        delivery.trackingNumber,
        delivery.recipientName,
        delivery.deliveryAddress,
        delivery.status,
      ].some((value) =>
        (value ?? '').toLowerCase().includes(normalizedSearch),
      )

      const matchesStatus =
        activePage !== 'Deliveries' ||
        deliveryStatusFilter === 'ALL' ||
        delivery.status === deliveryStatusFilter

      return matchesSearch && matchesStatus
    })
    .slice()
    .reverse()

  const displayedDeliveries =
    activePage === 'Dashboard'
      ? filteredDeliveries.slice(0, 5)
      : filteredDeliveries

  const filteredDrivers = drivers.filter((driver) => {
    const search = driverSearch.trim().toLowerCase()

    const matchesSearch = [
      driver.fullName,
      driver.email,
      driver.licenseNumber,
      driver.phoneNumber,
    ].some((value) => (value ?? '').toLowerCase().includes(search))

    const matchesStatus =
      driverStatusFilter === 'ALL' ||
      driver.status === driverStatusFilter

    return matchesSearch && matchesStatus
  })

  const filteredVehicles = vehicles.filter((vehicle) => {
    const search = vehicleSearch.trim().toLowerCase()

    const matchesSearch = [
      vehicle.registrationNumber,
      vehicle.vehicleType,
      vehicle.make,
      vehicle.model,
    ].some((value) => (value ?? '').toLowerCase().includes(search))

    const matchesStatus =
      vehicleStatusFilter === 'ALL' ||
      vehicle.status === vehicleStatusFilter

    return matchesSearch && matchesStatus
  })

  const filteredAssignments = assignments.filter((assignment) => {
    const search = assignmentSearch.trim().toLowerCase()

    const matchesSearch =
      String(assignment.id).includes(search) ||
      String(assignment.delivery?.trackingNumber ?? '')
        .toLowerCase()
        .includes(search) ||
      String(assignment.driver?.fullName ?? '')
        .toLowerCase()
        .includes(search) ||
      String(assignment.vehicle?.registrationNumber ?? '')
        .toLowerCase()
        .includes(search)

    const matchesStatus =
      assignmentStatusFilter === 'ALL' ||
      assignment.delivery?.status === assignmentStatusFilter

    return matchesSearch && matchesStatus
  })

  // Navigation
  const navigateTo = (page: Page) => {
    setActivePage(page)
    setShowDeliveryForm(false)
    setShowDriverForm(false)
    setShowVehicleForm(false)
    setShowAssignmentForm(false)
    setShowProofForm(false)
    setEditingDriverId(null)
    setEditingVehicleId(null)
    setSearchTerm('')
    setDriverSearch('')
    setVehicleSearch('')
    setAssignmentSearch('')
    setError('')
  }

  // Delivery handlers
  const handleCreateDelivery = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setError('')

      await api.createDelivery({
        trackingNumber: trackingNumber.trim(),
        recipientName: recipientName.trim(),
        deliveryAddress: deliveryAddress.trim(),
      })

      setTrackingNumber('')
      setRecipientName('')
      setDeliveryAddress('')
      setShowDeliveryForm(false)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create delivery.',
      )
    }
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      setError('')
      await api.updateDeliveryStatus(id, status)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update delivery status.',
      )
    }
  }

  const handleDeleteDelivery = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this delivery?')) {
      return
    }

    try {
      setError('')
      await api.deleteDelivery(id)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete delivery.',
      )
    }
  }

  // Driver handlers
  const handleCreateDriver = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setError('')

      await api.createDriver({
        fullName: driverFullName.trim(),
        email: driverEmail.trim(),
        phoneNumber: driverPhone.trim(),
        licenseNumber: driverLicense.trim(),
      })

      setDriverFullName('')
      setDriverEmail('')
      setDriverPhone('')
      setDriverLicense('')
      setShowDriverForm(false)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create driver.',
      )
    }
  }

  const handleUpdateDriver = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (editingDriverId === null) return

    try {
      setError('')

      await api.updateDriver(editingDriverId, {
        fullName: editDriverName.trim(),
        email: editDriverEmail.trim(),
        phoneNumber: editDriverPhone.trim(),
        licenseNumber: editDriverLicense.trim(),
        status: editDriverStatus,
      })

      setEditingDriverId(null)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update driver.',
      )
    }
  }

  const handleDeleteDriver = async (driver: Driver) => {
    if (!window.confirm(`Delete driver ${driver.fullName}?`)) return

    try {
      setError('')
      await api.deleteDriver(driver.id)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete driver.',
      )
    }
  }

  // Vehicle handlers
  const handleCreateVehicle = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    try {
      setError('')

      await api.createVehicle({
        registrationNumber: vehicleRegistration.trim(),
        vehicleType,
        make: vehicleMake.trim(),
        model: vehicleModel.trim(),
      })

      setVehicleRegistration('')
      setVehicleType('VAN')
      setVehicleMake('')
      setVehicleModel('')
      setShowVehicleForm(false)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create vehicle.',
      )
    }
  }

  const handleUpdateVehicle = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (editingVehicleId === null) return

    try {
      setError('')

      await api.updateVehicle(editingVehicleId, {
        registrationNumber: editVehicleRegistration.trim(),
        vehicleType: editVehicleType,
        make: editVehicleMake.trim(),
        model: editVehicleModel.trim(),
        status: editVehicleStatus,
      })

      setEditingVehicleId(null)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update vehicle.',
      )
    }
  }

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    if (
      !window.confirm(
        `Delete vehicle ${vehicle.registrationNumber}?`,
      )
    ) {
      return
    }

    try {
      setError('')
      await api.deleteVehicle(vehicle.id)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete vehicle.',
      )
    }
  }

  // Assignment handlers
  const handleCreateAssignment = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (
      !assignmentDeliveryId ||
      !assignmentDriverId ||
      !assignmentVehicleId
    ) {
      setError('Select a delivery, driver, and vehicle.')
      return
    }

    try {
      setError('')

      await api.createAssignment({
        deliveryId: Number(assignmentDeliveryId),
        driverId: Number(assignmentDriverId),
        vehicleId: Number(assignmentVehicleId),
      })

      setAssignmentDeliveryId('')
      setAssignmentDriverId('')
      setAssignmentVehicleId('')
      setShowAssignmentForm(false)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create assignment.',
      )
    }
  }

  const handleRecordProof = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    if (!proofAssignmentId || !proofReceivedBy.trim()) {
      setError('Select an assignment and enter the recipient name.')
      return
    }

    try {
      setError('')

      await api.recordProofOfDelivery(Number(proofAssignmentId), {
        receivedBy: proofReceivedBy.trim(),
        deliveryNotes: proofDeliveryNotes.trim(),
      })

      setProofAssignmentId('')
      setProofReceivedBy('')
      setProofDeliveryNotes('')
      setShowProofForm(false)
      await loadData(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to record proof of delivery.',
      )
    }
  }

  // Page action buttons
  const renderPageAction = () => {
    if (activePage === 'Dashboard' || activePage === 'Deliveries') {
      return (
        <button
          type="button"
          className="refresh-button"
          onClick={() => setShowDeliveryForm((show) => !show)}
        >
          {showDeliveryForm ? 'Cancel' : '+ Create Delivery'}
        </button>
      )
    }

    if (activePage === 'Drivers') {
      return (
        <button
          type="button"
          className="refresh-button"
          onClick={() => setShowDriverForm((show) => !show)}
        >
          {showDriverForm ? 'Cancel' : '+ Add Driver'}
        </button>
      )
    }

    if (activePage === 'Vehicles') {
      return (
        <button
          type="button"
          className="refresh-button"
          onClick={() => setShowVehicleForm((show) => !show)}
        >
          {showVehicleForm ? 'Cancel' : '+ Add Vehicle'}
        </button>
      )
    }

    if (activePage === 'Assignments') {
      return (
        <div className="assignment-actions">
          <button
            type="button"
            className="refresh-button"
            onClick={() => {
              setShowAssignmentForm((show) => !show)
              setShowProofForm(false)
            }}
          >
            {showAssignmentForm ? 'Cancel Assignment' : '+ Create Assignment'}
          </button>

          <button
            type="button"
            className="refresh-button"
            onClick={() => {
              setShowProofForm((show) => !show)
              setShowAssignmentForm(false)
            }}
          >
            {showProofForm ? 'Cancel Proof' : 'Record Proof of Delivery'}
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="brand">FleetFlow</h2>
        <p className="brand-subtitle">DELIVERY MANAGEMENT</p>

        <nav>
          {menuItems.map((item) => (
            <button
              type="button"
              key={item}
              className={`nav-item ${activePage === item ? 'active' : ''}`}
              onClick={() => navigateTo(item)}
            >
              <span>
                {{
                  Dashboard: '▦',
                  Deliveries: '▣',
                  Drivers: '♙',
                  Vehicles: '▤',
                  Assignments: '⇄',
                }[item]}
              </span>
              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" />
          {error ? 'Connection issue' : 'FleetFlow API'}
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">OPERATIONS / OVERVIEW</p>
            <h1>{activePage}</h1>
          </div>

          <div className="user-profile">
            <div className="avatar">AD</div>
            <div>
              <strong>Administrator</strong>
              <small>Fleet Manager</small>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            <strong>Request or connection error</strong>
            <p>{error}</p>
            <p>Check that Spring Boot is running on port 8080.</p>
            <button
              type="button"
              className="refresh-button"
              onClick={() => void loadData(true)}
              disabled={refreshing}
            >
              {refreshing ? 'Retrying...' : 'Retry connection'}
            </button>
          </div>
        )}

        {loading && (
          <p className="loading-message">Loading fleet data...</p>
        )}

        <section className="welcome">
          <div>
            <p className="eyebrow">FLEET OPERATIONS</p>
            <h2>Delivery operations at a glance.</h2>
            <p>Manage deliveries, drivers, vehicles and assignments.</p>
          </div>
          <div className="welcome-icon">↗</div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <p>Total Deliveries</p>
            <h3>{loading ? '—' : deliveries.length}</h3>
            <span>All recorded deliveries</span>
          </article>

          <article className="stat-card">
            <p>Drivers On Delivery</p>
            <h3>{loading ? '—' : activeDrivers}</h3>
            <span>Currently assigned to deliveries</span>
          </article>

          <article className="stat-card">
            <p>Available Vehicles</p>
            <h3>{loading ? '—' : availableVehicles}</h3>
            <span>Ready for assignment</span>
          </article>

          <article className="stat-card">
            <p>Completed Deliveries</p>
            <h3>{loading ? '—' : completedDeliveries}</h3>
            <span>Successfully delivered</span>
          </article>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>
                {activePage === 'Dashboard'
                  ? 'Recent Deliveries'
                  : activePage}
              </h2>
              <p>Live data retrieved from your Spring Boot backend.</p>
            </div>

            <div className="panel-actions">
              {renderPageAction()}

              {(activePage === 'Dashboard' ||
                activePage === 'Deliveries') && (
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search deliveries..."
                  aria-label="Search deliveries"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              )}

              <span className="coming-soon">
                {error ? 'OFFLINE' : loading ? 'LOADING' : 'API CONNECTED'}
              </span>

              <button
                type="button"
                className="refresh-button"
                onClick={() => void loadData(true)}
                disabled={refreshing || loading}
              >
                {refreshing ? 'Refreshing...' : '↻ Refresh'}
              </button>
            </div>
          </div>

          {/* Delivery form */}
          {(activePage === 'Dashboard' ||
            activePage === 'Deliveries') &&
            showDeliveryForm && (
              <form
                onSubmit={handleCreateDelivery}
                className="delivery-form"
              >
                <label>
                  Tracking Number
                  <input
                    value={trackingNumber}
                    onChange={(event) =>
                      setTrackingNumber(event.target.value)
                    }
                    placeholder="e.g. FF-1001"
                    required
                  />
                </label>

                <label>
                  Recipient Name
                  <input
                    value={recipientName}
                    onChange={(event) =>
                      setRecipientName(event.target.value)
                    }
                    placeholder="Full name"
                    required
                  />
                </label>

                <label>
                  Delivery Address
                  <input
                    value={deliveryAddress}
                    onChange={(event) =>
                      setDeliveryAddress(event.target.value)
                    }
                    placeholder="Delivery address"
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="refresh-button"
                  disabled={loading}
                >
                  Save Delivery
                </button>
              </form>
            )}

          {/* Delivery filters */}
          {activePage === 'Deliveries' && (
            <div className="delivery-filters">
              <label>
                Filter by status
                <select
                  className="delivery-status-filter"
                  value={deliveryStatusFilter}
                  onChange={(event) =>
                    setDeliveryStatusFilter(event.target.value)
                  }
                >
                  <option value="ALL">All Statuses</option>
                  {DELIVERY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Drivers */}
          {activePage === 'Drivers' && (
            <>
              <div className="driver-filters">
                <input
                  type="search"
                  placeholder="Search name, email or license..."
                  value={driverSearch}
                  onChange={(event) => setDriverSearch(event.target.value)}
                />

                <select
                  value={driverStatusFilter}
                  onChange={(event) =>
                    setDriverStatusFilter(event.target.value)
                  }
                  aria-label="Filter drivers by status"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ON_DELIVERY">On Delivery</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>

              {showDriverForm && (
                <form
                  onSubmit={handleCreateDriver}
                  className="delivery-form"
                >
                  <label>
                    Full Name
                    <input
                      value={driverFullName}
                      onChange={(event) =>
                        setDriverFullName(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={driverEmail}
                      onChange={(event) =>
                        setDriverEmail(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(event) =>
                        setDriverPhone(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    License Number
                    <input
                      value={driverLicense}
                      onChange={(event) =>
                        setDriverLicense(event.target.value)
                      }
                      required
                    />
                  </label>

                  <button type="submit" className="refresh-button">
                    Save Driver
                  </button>
                </form>
              )}

              {editingDriverId !== null && (
                <form
                  className="assignment-form"
                  onSubmit={handleUpdateDriver}
                >
                  <h3>Edit Driver</h3>

                  <label>
                    Full Name
                    <input
                      value={editDriverName}
                      onChange={(event) =>
                        setEditDriverName(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      value={editDriverEmail}
                      onChange={(event) =>
                        setEditDriverEmail(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      value={editDriverPhone}
                      onChange={(event) =>
                        setEditDriverPhone(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    License Number
                    <input
                      value={editDriverLicense}
                      onChange={(event) =>
                        setEditDriverLicense(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={editDriverStatus}
                      onChange={(event) =>
                        setEditDriverStatus(event.target.value)
                      }
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="ON_DELIVERY">On Delivery</option>
                      <option value="UNAVAILABLE">Unavailable</option>
                    </select>
                  </label>

                  <button type="submit">Save Changes</button>
                  <button
                    type="button"
                    onClick={() => setEditingDriverId(null)}
                  >
                    Cancel
                  </button>
                </form>
              )}

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>License</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && filteredDrivers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="table-empty">
                          No matching drivers found.
                        </td>
                      </tr>
                    )}

                    {filteredDrivers.map((driver) => (
                      <tr key={driver.id}>
                        <td>{driver.fullName}</td>
                        <td>{driver.email}</td>
                        <td>{driver.licenseNumber}</td>
                        <td>
                          <span
                            className={`status-badge ${driver.status.toLowerCase()}`}
                          >
                            {driver.status.replaceAll('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDriverId(driver.id)
                              setEditDriverName(driver.fullName)
                              setEditDriverEmail(driver.email)
                              setEditDriverPhone(driver.phoneNumber ?? '')
                              setEditDriverLicense(driver.licenseNumber)
                              setEditDriverStatus(driver.status)
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDeleteDriver(driver)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Vehicles */}
          {activePage === 'Vehicles' && (
            <>
              <div className="vehicle-filters">
                <input
                  type="search"
                  placeholder="Search registration, make or model..."
                  value={vehicleSearch}
                  onChange={(event) => setVehicleSearch(event.target.value)}
                />

                <select
                  value={vehicleStatusFilter}
                  onChange={(event) =>
                    setVehicleStatusFilter(event.target.value)
                  }
                  aria-label="Filter vehicles by status"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_USE">In Use</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              {showVehicleForm && (
                <form
                  onSubmit={handleCreateVehicle}
                  className="delivery-form"
                >
                  <label>
                    Registration Number
                    <input
                      value={vehicleRegistration}
                      onChange={(event) =>
                        setVehicleRegistration(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Vehicle Type
                    <select
                      value={vehicleType}
                      onChange={(event) => setVehicleType(event.target.value)}
                      required
                    >
                      <option value="VAN">Van</option>
                      <option value="TRUCK">Truck</option>
                      <option value="CAR">Car</option>
                      <option value="MOTORCYCLE">Motorcycle</option>
                    </select>
                  </label>

                  <label>
                    Make
                    <input
                      value={vehicleMake}
                      onChange={(event) => setVehicleMake(event.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Model
                    <input
                      value={vehicleModel}
                      onChange={(event) =>
                        setVehicleModel(event.target.value)
                      }
                      required
                    />
                  </label>

                  <button type="submit" className="refresh-button">
                    Save Vehicle
                  </button>
                </form>
              )}

              {editingVehicleId !== null && (
                <form
                  className="assignment-form"
                  onSubmit={handleUpdateVehicle}
                >
                  <h3>Edit Vehicle</h3>

                  <label>
                    Registration Number
                    <input
                      value={editVehicleRegistration}
                      onChange={(event) =>
                        setEditVehicleRegistration(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Vehicle Type
                    <select
                      value={editVehicleType}
                      onChange={(event) =>
                        setEditVehicleType(event.target.value)
                      }
                      required
                    >
                      <option value="VAN">Van</option>
                      <option value="TRUCK">Truck</option>
                      <option value="CAR">Car</option>
                      <option value="MOTORCYCLE">Motorcycle</option>
                    </select>
                  </label>

                  <label>
                    Make
                    <input
                      value={editVehicleMake}
                      onChange={(event) =>
                        setEditVehicleMake(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Model
                    <input
                      value={editVehicleModel}
                      onChange={(event) =>
                        setEditVehicleModel(event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={editVehicleStatus}
                      onChange={(event) =>
                        setEditVehicleStatus(event.target.value)
                      }
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="IN_USE">In Use</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </label>

                  <button type="submit">Save Changes</button>
                  <button
                    type="button"
                    onClick={() => setEditingVehicleId(null)}
                  >
                    Cancel
                  </button>
                </form>
              )}

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Registration</th>
                      <th>Type</th>
                      <th>Make / Model</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && filteredVehicles.length === 0 && (
                      <tr>
                        <td colSpan={5} className="table-empty">
                          No matching vehicles found.
                        </td>
                      </tr>
                    )}

                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>{vehicle.registrationNumber}</td>
                        <td>{vehicle.vehicleType}</td>
                        <td>
                          {[vehicle.make, vehicle.model]
                            .filter(Boolean)
                            .join(' ') || '—'}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${vehicle.status.toLowerCase()}`}
                          >
                            {vehicle.status.replaceAll('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVehicleId(vehicle.id)
                              setEditVehicleRegistration(
                                vehicle.registrationNumber,
                              )
                              setEditVehicleType(vehicle.vehicleType)
                              setEditVehicleMake(vehicle.make ?? '')
                              setEditVehicleModel(vehicle.model ?? '')
                              setEditVehicleStatus(vehicle.status)
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDeleteVehicle(vehicle)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Assignments */}
          {activePage === 'Assignments' && (
            <>
              <div className="assignment-filters">
                <input
                  type="search"
                  placeholder="Search assignment, tracking, driver or vehicle..."
                  value={assignmentSearch}
                  onChange={(event) =>
                    setAssignmentSearch(event.target.value)
                  }
                />

                <select
                  value={assignmentStatusFilter}
                  onChange={(event) =>
                    setAssignmentStatusFilter(event.target.value)
                  }
                  aria-label="Filter assignments by delivery status"
                >
                  <option value="ALL">All Delivery Statuses</option>
                  {DELIVERY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {showAssignmentForm && (
                <form
                  className="assignment-form"
                  onSubmit={handleCreateAssignment}
                >
                  <label>
                    Delivery
                    <select
                      value={assignmentDeliveryId}
                      onChange={(event) =>
                        setAssignmentDeliveryId(event.target.value)
                      }
                      required
                    >
                      <option value="">Select pending delivery</option>
                      {deliveries
                        .filter(
                          (delivery) => delivery.status === 'PENDING',
                        )
                        .map((delivery) => (
                          <option key={delivery.id} value={delivery.id}>
                            {delivery.trackingNumber} — {delivery.recipientName}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    Driver
                    <select
                      value={assignmentDriverId}
                      onChange={(event) =>
                        setAssignmentDriverId(event.target.value)
                      }
                      required
                    >
                      <option value="">Select available driver</option>
                      {drivers
                        .filter((driver) => driver.status === 'AVAILABLE')
                        .map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.fullName}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    Vehicle
                    <select
                      value={assignmentVehicleId}
                      onChange={(event) =>
                        setAssignmentVehicleId(event.target.value)
                      }
                      required
                    >
                      <option value="">Select available vehicle</option>
                      {vehicles
                        .filter((vehicle) => vehicle.status === 'AVAILABLE')
                        .map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.registrationNumber} — {vehicle.make}{' '}
                            {vehicle.model}
                          </option>
                        ))}
                    </select>
                  </label>

                  <button type="submit">Assign Delivery</button>
                </form>
              )}

              {showProofForm && (
                <form
                  className="assignment-form proof-form"
                  onSubmit={handleRecordProof}
                >
                  <label>
                    Active Assignment
                    <select
                      value={proofAssignmentId}
                      onChange={(event) =>
                        setProofAssignmentId(event.target.value)
                      }
                      required
                    >
                      <option value="">Select active assignment</option>
                      {assignments
                        .filter(
                          (assignment) =>
                            assignment.delivery?.status === 'IN_TRANSIT',
                        )
                        .map((assignment) => (
                          <option
                            key={assignment.id}
                            value={assignment.id}
                          >
                            #{assignment.id} —{' '}
                            {assignment.delivery?.trackingNumber ?? 'Delivery'}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    Received By
                    <input
                      value={proofReceivedBy}
                      onChange={(event) =>
                        setProofReceivedBy(event.target.value)
                      }
                      placeholder="Recipient's full name"
                      required
                    />
                  </label>

                  <label>
                    Delivery Notes
                    <input
                      value={proofDeliveryNotes}
                      onChange={(event) =>
                        setProofDeliveryNotes(event.target.value)
                      }
                      placeholder="Optional delivery notes"
                    />
                  </label>

                  <button type="submit">Confirm Delivery</button>
                </form>
              )}

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Tracking No.</th>
                      <th>Driver</th>
                      <th>Vehicle</th>
                      <th>Delivery Status</th>
                      <th>Assigned At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && filteredAssignments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="table-empty">
                          No matching assignments found.
                        </td>
                      </tr>
                    )}

                    {filteredAssignments.map((assignment) => (
                      <tr key={assignment.id}>
                        <td>#{assignment.id}</td>
                        <td>
                          {assignment.delivery?.trackingNumber ?? '—'}
                        </td>
                        <td>{assignment.driver?.fullName ?? '—'}</td>
                        <td>
                          {assignment.vehicle?.registrationNumber ?? '—'}
                        </td>
                        <td>
                          {assignment.delivery?.status?.replaceAll('_', ' ') ??
                            '—'}
                        </td>
                        <td>
                          {assignment.assignedAt
                            ? new Date(
                                assignment.assignedAt,
                              ).toLocaleString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Deliveries table */}
          {(activePage === 'Dashboard' ||
            activePage === 'Deliveries') && (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tracking No.</th>
                    <th>Recipient</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && displayedDeliveries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="table-empty">
                        No matching deliveries found.
                      </td>
                    </tr>
                  )}

                  {displayedDeliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td>{delivery.trackingNumber}</td>
                      <td>{delivery.recipientName}</td>
                      <td>{delivery.deliveryAddress}</td>
                      <td>
                        <select
                          className="status-select"
                          value={delivery.status}
                          aria-label={`Status for ${delivery.trackingNumber}`}
                          onChange={(event) =>
                            void handleUpdateStatus(
                              delivery.id,
                              event.target.value,
                            )
                          }
                        >
                          {DELIVERY_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replaceAll('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            void handleDeleteDelivery(delivery.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
