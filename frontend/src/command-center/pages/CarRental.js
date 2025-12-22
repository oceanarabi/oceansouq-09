import React, { useState, useEffect } from 'react';

const CarRental = () => {
  const [activeTab, setActiveTab] = useState('cars');
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      if (activeTab === 'cars') {
        const res = await fetch(`${API_URL}/api/car-rental/cars`, { headers });
        const data = await res.json();
        setCars(data.cars || []);
      } else if (activeTab === 'bookings') {
        const res = await fetch(`${API_URL}/api/car-rental/bookings`, { headers });
        const data = await res.json();
        setBookings(data.bookings || []);
      } else if (activeTab === 'locations') {
        const res = await fetch(`${API_URL}/api/car-rental/locations`, { headers });
        const data = await res.json();
        setLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'cars', label: 'السيارات', icon: '🚗' },
    { id: 'bookings', label: 'الحجوزات', icon: '📅' },
    { id: 'locations', label: 'المواقع', icon: '📍' }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🚗 تأجير السيارات</h1>
        <p className="text-gray-400">خدمة تأجير السيارات المتكاملة</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setLoading(true); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Cars Tab */}
          {activeTab === 'cars' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map(car => (
                <div key={car.id} className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-6xl">🚗</span>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{car.brand} {car.model}</h3>
                        <p className="text-gray-400 text-sm">{car.category} • {car.year}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span>{car.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-gray-700 px-2 py-1 rounded text-xs">{car.seats} مقاعد</span>
                      <span className="bg-gray-700 px-2 py-1 rounded text-xs">{car.transmission}</span>
                      <span className="bg-gray-700 px-2 py-1 rounded text-xs">{car.fuel_type}</span>
                      <span className="bg-gray-700 px-2 py-1 rounded text-xs">{car.color}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {car.features?.slice(0, 3).map((f, idx) => (
                        <span key={idx} className="text-xs text-gray-400">✓ {f}</span>
                      ))}
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                        <div>
                          <div className="text-gray-400">يومي</div>
                          <div className="font-bold text-green-400">{car.daily_rate} ر.س</div>
                        </div>
                        <div>
                          <div className="text-gray-400">أسبوعي</div>
                          <div className="font-bold">{car.weekly_rate} ر.س</div>
                        </div>
                        <div>
                          <div className="text-gray-400">شهري</div>
                          <div className="font-bold">{car.monthly_rate} ر.س</div>
                        </div>
                      </div>

                      <button 
                        className={`w-full py-2 rounded-lg ${car.available ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'}`}
                        disabled={!car.available}
                      >
                        {car.available ? 'احجز الآن' : 'غير متاح'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="bg-gray-800 p-6 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-blue-400">{booking.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${booking.status === 'active' ? 'bg-green-600' : booking.status === 'completed' ? 'bg-gray-600' : 'bg-red-600'}`}>
                          {booking.status === 'active' ? 'نشط' : booking.status === 'completed' ? 'مكتمل' : 'ملغي'}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">{booking.car}</h3>
                      <p className="text-gray-400">
                        📅 {booking.pickup_date} → {booking.return_date}
                      </p>
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-bold text-green-400">{booking.total} ر.س</div>
                      {booking.status === 'active' && (
                        <button className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm">إلغاء</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <span className="text-4xl">📅</span>
                  <p className="mt-2">لا توجد حجوزات</p>
                </div>
              )}
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map(loc => (
                <div key={loc.id} className="bg-gray-800 p-6 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xl">{loc.type === 'airport' ? '✈️' : '🏢'}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{loc.name}</h3>
                      <p className="text-gray-400 text-sm">📍 {loc.city}</p>
                      <p className="text-gray-400 text-sm">⏰ {loc.hours}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${loc.type === 'airport' ? 'bg-blue-600' : 'bg-green-600'}`}>
                      {loc.type === 'airport' ? 'مطار' : 'مدينة'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CarRental;