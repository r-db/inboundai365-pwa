// Appointment Booking Flow for PWA Template
class AppointmentBooking {
  constructor(tenantId) {
    this.tenantId = tenantId;
    this.selectedDate = null;
    this.selectedTime = null;
    this.selectedService = null;
    this.customerInfo = {};
  }

  async init() {
    this.createBookingUI();
    await this.loadServices();
  }

  createBookingUI() {
    const container = document.createElement('div');
    container.id = 'appointment-booking';
    container.className = 'booking-container';
    container.innerHTML = `
      <div class="booking-modal">
        <div class="booking-header">
          <h2>Book an Appointment</h2>
          <button class="close-btn" onclick="appointmentBooking.close()">&times;</button>
        </div>
        
        <div class="booking-content">
          <!-- Step 1: Service Selection -->
          <div class="booking-step" id="step-service" style="display: block;">
            <h3>Select a Service</h3>
            <div id="services-list" class="services-grid"></div>
            <button class="btn-next" onclick="appointmentBooking.nextStep('date')">Next</button>
          </div>

          <!-- Step 2: Date Selection -->
          <div class="booking-step" id="step-date" style="display: none;">
            <h3>Choose a Date</h3>
            <input type="date" id="date-picker" class="date-input" 
                   min="${new Date().toISOString().split('T')[0]}">
            <button class="btn-back" onclick="appointmentBooking.prevStep('service')">Back</button>
            <button class="btn-next" onclick="appointmentBooking.nextStep('time')">Next</button>
          </div>

          <!-- Step 3: Time Selection -->
          <div class="booking-step" id="step-time" style="display: none;">
            <h3>Select a Time</h3>
            <div id="time-slots" class="time-grid"></div>
            <button class="btn-back" onclick="appointmentBooking.prevStep('date')">Back</button>
          </div>

          <!-- Step 4: Contact Info -->
          <div class="booking-step" id="step-info" style="display: none;">
            <h3>Your Information</h3>
            <div class="form-group">
              <label>First Name</label>
              <input type="text" id="first-name" placeholder="John">
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" id="last-name" placeholder="Doe">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" id="phone" placeholder="(555) 123-4567">
            </div>
            <div class="form-group">
              <label>Email (optional)</label>
              <input type="email" id="email" placeholder="john@example.com">
            </div>
            <button class="btn-back" onclick="appointmentBooking.prevStep('time')">Back</button>
            <button class="btn-book" onclick="appointmentBooking.bookAppointment()">Book Appointment</button>
          </div>

          <!-- Step 5: Confirmation -->
          <div class="booking-step" id="step-confirm" style="display: none;">
            <div class="confirmation">
              <div class="success-icon">✓</div>
              <h3>Appointment Booked!</h3>
              <div id="confirmation-details"></div>
              <button class="btn-close" onclick="appointmentBooking.close()">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  async loadServices() {
    const res = await fetch(`/api/tenants/${this.tenantId}/services`);
    const data = await res.json();
    
    const servicesList = document.getElementById('services-list');
    servicesList.innerHTML = data.services.map(service => `
      <div class="service-card" onclick="appointmentBooking.selectService('${service.service_id}', '${service.name}')">
        <div class="service-name">${service.name}</div>
        <div class="service-details">
          <span>${service.duration_minutes} min</span>
          ${service.price > 0 ? `<span>$${service.price}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  selectService(serviceId, serviceName) {
    this.selectedService = { id: serviceId, name: serviceName };
    document.querySelectorAll('.service-card').forEach(card => card.classList.remove('selected'));
    event.target.closest('.service-card').classList.add('selected');
  }

  async nextStep(step) {
    if (step === 'date') {
      if (!this.selectedService) {
        alert('Please select a service');
        return;
      }
    }

    if (step === 'time') {
      this.selectedDate = document.getElementById('date-picker').value;
      if (!this.selectedDate) {
        alert('Please select a date');
        return;
      }
      await this.loadTimeSlots();
    }

    this.showStep(step);
  }

  prevStep(step) {
    this.showStep(step);
  }

  showStep(step) {
    document.querySelectorAll('.booking-step').forEach(el => el.style.display = 'none');
    document.getElementById(`step-${step}`).style.display = 'block';
  }

  async loadTimeSlots() {
    const res = await fetch(`/api/tools/check_availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId
      },
      body: JSON.stringify({
        date: this.selectedDate,
        service: this.selectedService.name
      })
    });

    const data = await res.json();
    const timeSlots = document.getElementById('time-slots');
    
    if (data.available && data.slots.length > 0) {
      timeSlots.innerHTML = data.slots.map(time => `
        <button class="time-slot" onclick="appointmentBooking.selectTime('${time}')">
          ${this.formatTime(time)}
        </button>
      `).join('');
    } else {
      timeSlots.innerHTML = '<p>No available times for this date</p>';
    }
  }

  selectTime(time) {
    this.selectedTime = time;
    document.querySelectorAll('.time-slot').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    
    setTimeout(() => this.showStep('info'), 300);
  }

  async bookAppointment() {
    // Get customer info
    this.customerInfo = {
      firstName: document.getElementById('first-name').value,
      lastName: document.getElementById('last-name').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value
    };

    if (!this.customerInfo.firstName || !this.customerInfo.lastName || !this.customerInfo.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Create or get customer
    const customerRes = await fetch(`/api/tools/create_customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId
      },
      body: JSON.stringify({
        phone: this.customerInfo.phone,
        first_name: this.customerInfo.firstName,
        last_name: this.customerInfo.lastName,
        email: this.customerInfo.email
      })
    });

    const customerData = await customerRes.json();

    // Book appointment
    const bookRes = await fetch(`/api/tools/book_appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': this.tenantId
      },
      body: JSON.stringify({
        customer_id: customerData.customer_id,
        service: this.selectedService.name,
        date: this.selectedDate,
        time: this.selectedTime
      })
    });

    const bookData = await bookRes.json();

    if (bookData.success) {
      this.showConfirmation();
    } else {
      alert('Failed to book appointment: ' + bookData.error);
    }
  }

  showConfirmation() {
    document.getElementById('confirmation-details').innerHTML = `
      <p><strong>Service:</strong> ${this.selectedService.name}</p>
      <p><strong>Date:</strong> ${this.formatDate(this.selectedDate)}</p>
      <p><strong>Time:</strong> ${this.formatTime(this.selectedTime)}</p>
      <p><strong>Name:</strong> ${this.customerInfo.firstName} ${this.customerInfo.lastName}</p>
    `;
    this.showStep('confirm');
  }

  formatTime(time) {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHours = h % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }

  formatDate(date) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  show() {
    document.getElementById('appointment-booking').style.display = 'flex';
  }

  close() {
    document.getElementById('appointment-booking').style.display = 'none';
  }
}

// Global instance
let appointmentBooking = null;

// Initialize when needed
function initAppointmentBooking(tenantId) {
  if (!appointmentBooking) {
    appointmentBooking = new AppointmentBooking(tenantId);
    appointmentBooking.init();
  }
  appointmentBooking.show();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppointmentBooking, initAppointmentBooking };
}
