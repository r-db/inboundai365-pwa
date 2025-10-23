// Payment Handler with Stripe Elements
class PaymentHandler {
  constructor(tenantId, stripePublishableKey) {
    this.tenantId = tenantId;
    this.stripe = Stripe(stripePublishableKey);
    this.elements = null;
    this.cardElement = null;
  }

  async init() {
    this.createPaymentUI();
    this.setupStripeElements();
  }

  createPaymentUI() {
    const container = document.createElement('div');
    container.id = 'payment-modal';
    container.className = 'payment-container';
    container.innerHTML = `
      <div class="payment-modal">
        <div class="payment-header">
          <h2>Complete Payment</h2>
          <button class="close-btn" onclick="paymentHandler.close()">&times;</button>
        </div>
        
        <div class="payment-content">
          <div class="amount-display">
            <div class="amount-label">Amount Due</div>
            <div class="amount-value" id="payment-amount">$0.00</div>
          </div>

          <div class="payment-form">
            <div class="form-group">
              <label>Card Information</label>
              <div id="card-element" class="card-input"></div>
              <div id="card-errors" class="error-message"></div>
            </div>

            <div class="form-group">
              <label>Name on Card</label>
              <input type="text" id="cardholder-name" placeholder="John Doe" class="text-input">
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" id="save-card"> 
                Save card for future use
              </label>
            </div>

            <button id="submit-payment" class="btn-pay">
              <span id="button-text">Pay Now</span>
              <div id="spinner" class="spinner hidden"></div>
            </button>
          </div>

          <div class="payment-success hidden" id="payment-success">
            <div class="success-icon">✓</div>
            <h3>Payment Successful!</h3>
            <p id="success-message"></p>
            <button class="btn-close" onclick="paymentHandler.close()">Close</button>
          </div>
        </div>

        <div class="secure-badge">
          <svg width="16" height="16" viewBox="0 0 16 16"><path fill="#6b7280" d="M8 0L2 3v4c0 4 2.5 7 6 9 3.5-2 6-5 6-9V3L8 0z"/></svg>
          <span>Secured by Stripe</span>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  setupStripeElements() {
    this.elements = this.stripe.elements();
    
    this.cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': { color: '#aab7c4' }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      }
    });
    
    this.cardElement.mount('#card-element');
    
    this.cardElement.on('change', (event) => {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
    
    document.getElementById('submit-payment').addEventListener('click', () => {
      this.handleSubmit();
    });
  }

  async show(amount, description = 'Service payment') {
    document.getElementById('payment-modal').style.display = 'flex';
    document.getElementById('payment-amount').textContent = `$${amount.toFixed(2)}`;
    this.amount = amount;
    this.description = description;
    
    document.querySelector('.payment-form').classList.remove('hidden');
    document.getElementById('payment-success').classList.add('hidden');
  }

  async handleSubmit() {
    this.setLoading(true);
    
    const cardholderName = document.getElementById('cardholder-name').value;
    const saveCard = document.getElementById('save-card').checked;
    
    if (!cardholderName) {
      this.showError('Please enter cardholder name');
      this.setLoading(false);
      return;
    }
    
    try {
      // Create payment intent
      const intentResponse = await fetch(`/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': this.tenantId
        },
        body: JSON.stringify({
          amount: this.amount,
          description: this.description,
          save_card: saveCard
        })
      });
      
      const { clientSecret, error } = await intentResponse.json();
      
      if (error) {
        throw new Error(error);
      }
      
      // Confirm payment
      const { error: stripeError, paymentIntent } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: cardholderName
            }
          }
        }
      );
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        this.showSuccess(paymentIntent);
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  showSuccess(paymentIntent) {
    document.querySelector('.payment-form').classList.add('hidden');
    const successDiv = document.getElementById('payment-success');
    successDiv.classList.remove('hidden');
    
    document.getElementById('success-message').innerHTML = `
      <p>Amount: $${(paymentIntent.amount / 100).toFixed(2)}</p>
      <p>Transaction ID: ${paymentIntent.id}</p>
    `;
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('paymentSuccess', {
      detail: { paymentIntent }
    }));
  }

  showError(message) {
    const errorElement = document.getElementById('card-errors');
    errorElement.textContent = message;
    setTimeout(() => {
      errorElement.textContent = '';
    }, 5000);
  }

  setLoading(isLoading) {
    const button = document.getElementById('submit-payment');
    const spinner = document.getElementById('spinner');
    const buttonText = document.getElementById('button-text');
    
    if (isLoading) {
      button.disabled = true;
      spinner.classList.remove('hidden');
      buttonText.textContent = 'Processing...';
    } else {
      button.disabled = false;
      spinner.classList.add('hidden');
      buttonText.textContent = 'Pay Now';
    }
  }

  close() {
    document.getElementById('payment-modal').style.display = 'none';
    this.cardElement.clear();
    document.getElementById('cardholder-name').value = '';
    document.getElementById('save-card').checked = false;
    document.getElementById('card-errors').textContent = '';
  }
}

// Global instance
let paymentHandler = null;

function initPaymentHandler(tenantId, stripePublishableKey) {
  if (!paymentHandler) {
    paymentHandler = new PaymentHandler(tenantId, stripePublishableKey);
    paymentHandler.init();
  }
  return paymentHandler;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PaymentHandler, initPaymentHandler };
}
