import React, { useState, useRef, useEffect } from 'react';
import { Coffee, X } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface DonationFormData {
  amount: string;
  name: string;
  message: string;
}

const Footer: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<DonationFormData>({
    amount: '',
    name: '',
    message: ''
  });
  const formRef = useRef<HTMLDivElement>(null);

const [darkMode, setDarkMode] = useState(false);
useEffect(() => {
  setDarkMode(localStorage.getItem("theme") === "dark");
}, []);

  // Close form when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowForm(false);
      }
    };

    if (showForm) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showForm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.name) {
      alert('Please fill in amount and name fields');
      return;
    }

    const amountInPaise = parseInt(formData.amount) * 100; // in paise!

    const options = {
      key: import.meta.env.VITE_key_id_razor,
      amount: amountInPaise,
      currency: 'INR',
      name: 'Daily Notes Tracker',
      description: formData.message || 'Buy me a coffee ☕',
      handler: function (response: any) {
        // Handle successful payment
        console.log('Payment successful:', response);
        alert(`Thank you ${formData.name} for buying me a coffee! ☕`);
        setShowForm(false);
        setFormData({ amount: '100', name: '', message: '' });
        // You can send the payment details to your backend here
        fetch('http://localhost:3000/api/user/buyMeACoffee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            donor_name: formData.name,
            message: formData.message,
            amount: formData.amount
          })
        });
      },
      prefill: {
        name: formData.name,
        email: 'abcde@gmail.com',
        contact: '99999-99999'
      },
      notes: {
        address: formData.message || 'Thank you for supporting Daily Notes Tracker!',
        donor_name: formData.name
      },
      theme: {
        color: '#f59e0b'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment cancelled');
        }
      }
    };

    if (typeof window.Razorpay !== 'undefined') {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        alert('Failed to load payment gateway. Please try again later.');
      };
      document.body.appendChild(script);
    }
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
<footer className="bg-background border-t border-border mt-auto">
  <div className="ml-6 container mx-auto px-4 py-4">
    <div className="flex justify-start items-center relative">
      <button onClick={toggleForm}
        className="
          group flex items-center 
          bg-gradient-to-r from-amber-500 to-orange-500 
          hover:from-amber-600 hover:to-orange-600 
          text-white px-3 py-3 rounded-full
          transition-all duration-300 ease-in-out
          shadow-md hover:shadow-lg
        ">
        <Coffee size={18} className="shrink-0" />
        <span
          className="
            ml-2 whitespace-nowrap opacity-0 max-w-0 overflow-hidden
            group-hover:opacity-100 group-hover:max-w-[140px]
            transition-all duration-300 ease-in-out
          "
        >
          Buy me a coffee ☕
        </span>
      </button>
          {showForm && (
            <div
              ref={formRef}
              className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-lg shadow-lg p-4 w-80 z-50"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-foreground">Support with Coffee ☕</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div>
                  <label htmlFor="amount" className="block text-sm text-foreground mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                      ${darkMode 
                        ? 'bg-black text-white border-gray-600 placeholder-gray-400'
                        : 'bg-white text-black border-gray-300 placeholder-gray-500'}
                    `}
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm text-foreground mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                      ${darkMode 
                        ? 'bg-black text-white border-gray-600 placeholder-gray-400'
                        : 'bg-white text-black border-gray-300 placeholder-gray-500'}
                    `}
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm text-foreground mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={2}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                      ${darkMode 
                        ? 'bg-black text-white border-gray-600 placeholder-gray-400'
                        : 'bg-white text-black border-gray-300 placeholder-gray-500'}
                    `}
                    placeholder="Leave a message..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2 px-4 rounded-md transition-all duration-200 font-medium"
                >
                  Proceed to Payment
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;