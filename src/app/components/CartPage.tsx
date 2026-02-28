import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { PersistentCountdown } from '@/app/components/PersistentCountdown';

interface CartPageProps {
  onBack: () => void;
  onCheckout: () => void;
  hasJoinedWaitlist: boolean;
  offerExpired: boolean;
  onOfferExpire: () => void;
}

export function CartPage({ onBack, onCheckout, hasJoinedWaitlist, offerExpired, onOfferExpire }: CartPageProps) {
  const [isItemSelected, setIsItemSelected] = useState(true);
  const hasItems = hasJoinedWaitlist && !offerExpired;

  return (
    <div className="min-h-screen bg-[#FAF7F3]">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[#3D3D3D] hover:text-[#FD8829] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
          <h1 className="text-2xl text-[#3D3D3D]">Shopping Cart</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {hasItems ? (
          <>
            {/* Product Item */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-start gap-6">
                {/* Checkbox */}
                <input 
                  type="checkbox" 
                  checked={isItemSelected}
                  onChange={(e) => setIsItemSelected(e.target.checked)}
                  className="mt-2 w-5 h-5 text-[#FD8829] border-gray-300 rounded focus:ring-[#FD8829]"
                />

                {/* Product Image - Coupon Style */}
                <div className="w-32 h-32 flex-shrink-0">
                  <div className="relative bg-gradient-to-r from-[#FD8829] to-[#E57620] rounded-xl p-4 shadow-lg h-full flex items-center justify-center">
                    {/* Decorative circles */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FAF7F3] rounded-full"></div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FAF7F3] rounded-full"></div>
                    
                    <div className="text-center">
                      <div className="text-white text-3xl font-bold">50%</div>
                      <div className="text-white text-sm">OFF</div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">
                    Limited Offer: WoafyPet Bed 50% Off Voucher
                  </h3>
                  <div className="text-2xl font-bold text-[#3D3D3D]">$1.99</div>
                  
                  {/* Countdown */}
                  <div className="mt-4">
                    <div className="text-sm text-red-600 font-semibold mb-2">⏰ Offer expires in:</div>
                    <PersistentCountdown onExpire={onOfferExpire} />
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-[#3D3D3D] font-semibold">Total:</span>
                <span className="text-3xl text-[#3D3D3D] font-bold">
                  {isItemSelected ? '$1.99' : '$0.00'}
                </span>
              </div>

              <button
                onClick={onCheckout}
                disabled={!isItemSelected}
                className={`w-full px-8 py-4 text-lg rounded-lg transition-all duration-300 ${
                  isItemSelected
                    ? 'bg-[#FD8829] text-white hover:bg-[#E57620] shadow-lg cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Empty Cart */}
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl text-[#3D3D3D] mb-2">Your cart is empty</h2>
              <p className="text-[#666666] mb-6">
                {!hasJoinedWaitlist 
                  ? "Join our waiting list to unlock exclusive early bird offers!"
                  : "The limited offer has expired"}
              </p>
              <button
                onClick={onBack}
                className="px-8 py-3 bg-[#FD8829] text-white rounded-lg hover:bg-[#E57620] transition-all duration-300"
              >
                Continue Shopping
              </button>
            </div>

            {/* Disabled Checkout Button */}
            <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-gray-400 font-semibold">Total:</span>
                <span className="text-3xl text-gray-400 font-bold">$0.00</span>
              </div>

              <button
                disabled
                className="w-full px-8 py-4 bg-gray-300 text-gray-500 text-lg rounded-lg cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}