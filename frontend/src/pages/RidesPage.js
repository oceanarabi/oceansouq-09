import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Rides Home Page
export const RidesPage = () => {
  const [rideTypes, setRideTypes] = useState([]);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [selectedType, setSelectedType] = useState('economy');
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRideTypes();
    checkActiveRide();
  }, []);

  const fetchRideTypes = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/rides/types`);
      setRideTypes(res.data || []);
    } catch (err) {
      console.error('Error fetching ride types:', err);
    }
  };

  const checkActiveRide = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/api/rides/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) setActiveRide(res.data);
    } catch (err) {
      console.error('Error checking active ride:', err);
    }
  };

  const getEstimates = async () => {
    if (!pickup || !dropoff) return;
    
    setLoading(true);
    try {
      // For demo, use sample coordinates
      const res = await axios.post(`${API_URL}/api/rides/estimate`, null, {
        params: {
          pickup_lat: 24.7136,
          pickup_lng: 46.6753,
          dropoff_lat: 24.7250,
          dropoff_lng: 46.6800
        }
      });
      setEstimates(res.data || []);
    } catch (err) {
      console.error('Error getting estimates:', err);
    }
    setLoading(false);
  };

  const requestRide = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/rides');
      return;
    }

    setRequesting(true);
    try {
      const res = await axios.post(`${API_URL}/api/rides/request`, {
        pickup_lat: 24.7136,
        pickup_lng: 46.6753,
        pickup_address: pickup,
        dropoff_lat: 24.7250,
        dropoff_lng: 46.6800,
        dropoff_address: dropoff,
        ride_type: selectedType,
        payment_method: "cash"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActiveRide(res.data.ride);
    } catch (err) {
      alert(err.response?.data?.detail || 'حدث خطأ');
    }
    setRequesting(false);
  };

  const cancelRide = async () => {
    const token = localStorage.getItem('token');
    if (!activeRide) return;

    try {
      await axios.post(`${API_URL}/api/rides/${activeRide.id}/cancel`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveRide(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'حدث خطأ');
    }
  };

  // If there's an active ride, show tracking view
  if (activeRide) {
    return <RideTrackingView ride={activeRide} onCancel={cancelRide} onComplete={() => setActiveRide(null)} />;
  }

  const selectedEstimate = estimates.find(e => e.ride_type === selectedType);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🚗 المشاوير</h1>
          <p className="text-lg text-white/90">اطلب مشوارك الآن ووصل بأمان</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Booking Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 -mt-12 relative z-10">
            {/* Locations */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-xl">📍</span>
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="من أين؟ (نقطة الانطلاق)"
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-xl">📍</span>
                <input
                  type="text"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  onBlur={getEstimates}
                  placeholder="إلى أين؟ (الوجهة)"
                  className="w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>
            </div>

            {/* Ride Types */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">اختر نوع المشوار</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {rideTypes.map((type) => {
                  const estimate = estimates.find(e => e.ride_type === type.id);
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-xl border-2 text-center transition
                        ${selectedType === type.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'}`}
                    >
                      <span className="text-3xl block mb-2">{type.icon}</span>
                      <span className="font-semibold text-gray-900 dark:text-white block">{type.name}</span>
                      <span className="text-xs text-gray-500 block">{type.description}</span>
                      {estimate && (
                        <span className="text-blue-600 font-bold block mt-2">{estimate.estimated_fare} ر.س</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estimate Display */}
            {selectedEstimate && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">المسافة التقريبية</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedEstimate.distance} كم</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الوقت المتوقع</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedEstimate.estimated_time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">السعر المتوقع</p>
                    <p className="font-bold text-blue-600 text-xl">{selectedEstimate.estimated_fare} ر.س</p>
                  </div>
                </div>
              </div>
            )}

            {/* Request Button */}
            <button
              onClick={requestRide}
              disabled={!pickup || !dropoff || requesting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 transition"
            >
              {requesting ? 'جارٍ البحث عن كابتن...' : 'اطلب مشوار الآن'}
            </button>
          </div>

          {/* Promo Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🛡️', title: 'رحلات آمنة', desc: 'جميع الكباتن موثقون ومعتمدون' },
              { icon: '💰', title: 'أسعار شفافة', desc: 'اعرف السعر قبل الحجز' },
              { icon: '⏰', title: 'متوفر 24/7', desc: 'خدمة على مدار الساعة' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                <span className="text-4xl block mb-3">{item.icon}</span>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Become a Captain CTA */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-3">🚗 هل تريد أن تكون كابتن؟</h2>
            <p className="mb-6 text-white/90">انضم إلينا واكسب دخل إضافي بمرونة تامة</p>
            <Link 
              to="/join/captain"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
            >
              سجل ككابتن الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ride Tracking View Component
const RideTrackingView = ({ ride, onCancel, onComplete }) => {
  const statusInfo = {
    searching: { icon: '🔍', text: 'جارٍ البحث عن كابتن...', color: 'text-yellow-500' },
    accepted: { icon: '✅', text: 'تم قبول المشوار!', color: 'text-green-500' },
    arriving: { icon: '🚗', text: 'الكابتن في الطريق إليك', color: 'text-blue-500' },
    started: { icon: '🛣️', text: 'الرحلة جارية', color: 'text-purple-500' },
    completed: { icon: '🎉', text: 'تمت الرحلة بنجاح!', color: 'text-green-500' }
  };

  const currentStatus = statusInfo[ride.status] || statusInfo.searching;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Map Placeholder */}
      <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-8xl animate-pulse">{currentStatus.icon}</span>
            <p className={`text-xl font-bold mt-4 ${currentStatus.color}`}>{currentStatus.text}</p>
          </div>
        </div>
      </div>

      {/* Ride Info Card */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 max-w-lg mx-auto">
          {/* Locations */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-green-500">📍</span>
              <div>
                <p className="text-xs text-gray-500">من</p>
                <p className="text-gray-900 dark:text-white">{ride.pickup?.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-500">📍</span>
              <div>
                <p className="text-xs text-gray-500">إلى</p>
                <p className="text-gray-900 dark:text-white">{ride.dropoff?.address}</p>
              </div>
            </div>
          </div>

          {/* Captain Info (if assigned) */}
          {ride.captain_info && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-2xl text-white">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{ride.captain_info.name}</p>
                  <p className="text-sm text-gray-500">{ride.captain_info.vehicle_model}</p>
                  <p className="text-sm text-gray-500">{ride.captain_info.vehicle_plate}</p>
                </div>
                <div className="text-center">
                  <p className="flex items-center gap-1 text-yellow-500">
                    ⭐ <span className="font-bold">{ride.captain_info.rating}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold">
                  📞 اتصال
                </button>
                <button className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white py-2 rounded-lg font-semibold">
                  💬 رسالة
                </button>
              </div>
            </div>
          )}

          {/* Fare */}
          <div className="flex justify-between items-center py-4 border-t dark:border-gray-700">
            <span className="text-gray-500">السعر المتوقع</span>
            <span className="text-2xl font-bold text-blue-600">{ride.estimated_fare} ر.س</span>
          </div>

          {/* Actions */}
          {ride.status === 'searching' && (
            <button 
              onClick={onCancel}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition"
            >
              إلغاء الطلب
            </button>
          )}

          {ride.status === 'completed' && (
            <button 
              onClick={onComplete}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
            >
              تم ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RidesPage;
