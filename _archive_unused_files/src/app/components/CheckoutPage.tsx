import { useState } from 'react';
import { Lock, CheckCircle, ShieldCheck, Mail, CreditCard } from 'lucide-react';

interface CheckoutPageProps {
  onBack: () => void;
}

export function CheckoutPage({ onBack }: CheckoutPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'googlepay'>('card');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    zipCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onBack();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={onBack}
            className="text-[#666666] hover:text-[#3D3D3D] transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          
          {/* Left Column - Form */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl text-[#3D3D3D] mb-2">Secure Checkout</h1>
              <p className="text-[#666666]">Complete your VIP reservation in just a few steps</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section A: Contact Information */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl text-[#3D3D3D] mb-6">Contact Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#666666] mb-2">
                      Where should we send your voucher code?
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-[#666666] mb-2">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                    />
                  </div>
                </div>
              </div>

              {/* Section B: Payment Method */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-xl text-[#3D3D3D] mb-6">Payment Method</h2>

                {/* Payment Method Selector */}
                <div className="flex gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-3 px-4 border rounded-xl transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#FD8829] bg-orange-50 text-[#FD8829]'
                        : 'border-gray-300 text-[#666666] hover:border-gray-400'
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex-1 py-3 px-4 border rounded-xl transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-[#FD8829] bg-orange-50 text-[#FD8829]'
                        : 'border-gray-300 text-[#666666] hover:border-gray-400'
                    }`}
                  >
                    PayPal
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('googlepay')}
                    className={`flex-1 py-3 px-4 border rounded-xl transition-all ${
                      paymentMethod === 'googlepay'
                        ? 'border-[#FD8829] bg-orange-50 text-[#FD8829]'
                        : 'border-gray-300 text-[#666666] hover:border-gray-400'
                    }`}
                  >
                    Google Pay
                  </button>
                </div>

                {/* Card Input Fields */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#666666] mb-2">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          required
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                        />
                        <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-600" size={16} />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-[#666666] mb-2">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#666666] mb-2">CVC</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={formData.cvc}
                          onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#666666] mb-2">ZIP Code</label>
                        <input
                          type="text"
                          placeholder="12345"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD8829] focus:border-transparent text-[#3D3D3D]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                    <p className="text-[#666666] mb-4">You will be redirected to PayPal to complete your payment</p>
                  </div>
                )}

                {paymentMethod === 'googlepay' && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                    <p className="text-[#666666] mb-4">You will be redirected to Google Pay to complete your payment</p>
                  </div>
                )}
              </div>

              {/* Section C: Purchase Terms */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg text-[#3D3D3D] mb-4">What happens next?</h2>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-[#3D3D3D] font-semibold">Immediate Delivery:</span>
                      <span className="text-[#666666]"> Your unique 50% OFF code will be emailed to you instantly after payment.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-[#3D3D3D] font-semibold">Launch Priority:</span>
                      <span className="text-[#666666]"> You are locked in for the first batch of shipping.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-[#3D3D3D] font-semibold">100% Refundable:</span>
                      <span className="text-[#666666]"> Change your mind? Get a full refund of your $1.99 at any time before shipping.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <span className="text-[#3D3D3D] font-semibold">Valid for 6 Months:</span>
                      <span className="text-[#666666]"> The voucher is valid for 6 months from the official launch date.</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Section D: Action Button */}
              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-[#FD8829] text-white text-lg rounded-lg hover:bg-[#E57620] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Complete Purchase
                </button>

                <div className="flex items-center justify-center gap-2 text-sm text-[#666666]">
                  <ShieldCheck size={16} className="text-green-600" />
                  <span>256-bit SSL Secure Payment</span>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
              <h2 className="text-xl text-[#3D3D3D] mb-6">Order Summary</h2>

              {/* Voucher Visual */}
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-6 mb-6 text-center shadow-lg">
                <div className="text-white text-4xl mb-2">50% OFF</div>
                <div className="text-white text-sm">VIP Voucher</div>
              </div>

              {/* Package Title */}
              <h3 className="text-lg text-[#3D3D3D] mb-6">VIP Reservation Package</h3>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#3D3D3D] font-semibold">Due Today:</span>
                  <span className="text-3xl text-[#3D3D3D] font-bold">$1.99</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-300 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#666666]">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Instant email delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#666666]">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>100% refundable</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#666666]">
                  <CheckCircle size={16} className="text-green-600" />
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg mx-4 shadow-2xl p-8">
            {/* Animated Success Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
                <CheckCircle size={64} className="text-green-600" />
              </div>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl mb-3 text-[#3D3D3D]">Payment Successful! You're a VIP.</h2>
            </div>

            {/* Success Message */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <p className="text-[#666666] text-center mb-4">
                Your $1.99 reservation is confirmed. We've sent your <span className="text-[#FD8829] font-semibold">50% OFF Voucher Code</span> to:
              </p>
              <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                <Mail className="inline-block text-[#FD8829] mb-2" size={24} />
                <div className="text-[#3D3D3D] font-semibold">{formData.email || 'your@email.com'}</div>
              </div>
              <p className="text-sm text-[#666666] text-center mt-4">
                Please check your inbox (and spam folder) to save it!
              </p>
            </div>

            {/* Envelope Visual Cue */}
            <div className="text-center mb-6">
              <div className="inline-block bg-orange-50 rounded-full p-4">
                <Mail size={48} className="text-[#FD8829]" />
              </div>
            </div>

            {/* Return Button */}
            <button
              onClick={handleSuccessClose}
              className="w-full py-4 bg-[#FD8829] text-white text-lg rounded-lg hover:bg-[#E57620] transition-all duration-300 shadow-lg"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
