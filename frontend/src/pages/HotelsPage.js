import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Hotels Home Page
export const HotelsPage = () => {
  const [cities, setCities] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 2
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [citiesRes, hotelsRes] = await Promise.all([
        axios.get(`${API_URL}/api/hotels/cities`),
        axios.get(`${API_URL}/api/hotels/search`)
      ]);
      setCities(citiesRes.data || []);
      setHotels(hotelsRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/hotels/search`, {
        params: searchParams
      });
      setHotels(res.data || []);
    } catch (err) {
      console.error('Error searching:', err);
    }
    setLoading(false);
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-bounce text-6xl mb-4">🏨</div>
          <p className="text-gray-600 dark:text-gray-400">جارٍ تحميل الفنادق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">🏨 احجز إقامتك</h1>
            <p className="text-lg text-white/90 mb-8">
              اكتشف أفضل الفنادق والشقق الفندقية
            </p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">المدينة</label>
              <select
                value={searchParams.city}
                onChange={(e) => setSearchParams({...searchParams, city: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
              >
                <option value="">جميع المدن</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">تاريخ الوصول</label>
              <input
                type="date"
                value={searchParams.checkIn}
                onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">تاريخ المغادرة</label>
              <input
                type="date"
                value={searchParams.checkOut}
                onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">الضيوف</label>
              <select
                value={searchParams.guests}
                onChange={(e) => setSearchParams({...searchParams, guests: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
              >
                {[1,2,3,4,5,6].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'ضيف' : 'ضيوف'}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
          >
            {loading ? 'جارٍ البحث...' : '🔍 بحث'}
          </button>
        </form>
      </div>

      {/* Popular Cities */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">المدن الشائعة</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                setSearchParams({...searchParams, city: city.id});
                handleSearch(new Event('submit'));
              }}
              className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-4 text-center min-w-[120px] hover:shadow-lg transition"
            >
              <span className="text-3xl block mb-2">🏙️</span>
              <span className="font-semibold text-gray-900 dark:text-white block">{city.name}</span>
              <span className="text-xs text-gray-500">{city.hotels_count} فندق</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hotels List */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {hotels.length > 0 ? 'الفنادق المتاحة' : 'لا توجد فنادق حالياً'}
        </h2>
        
        {hotels.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <span className="text-6xl block mb-4">🏨</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لا توجد فنادق مسجلة</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              كن أول من يسجل فندقه على المنصة!
            </p>
            <Link 
              to="/join/hotel"
              className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              سجل فندقك الآن
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>

      {/* Register Hotel CTA */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">🏨 هل لديك فندق أو شقق فندقية؟</h2>
          <p className="mb-6 text-white/90">انضم إلى منصتنا وزد حجوزاتك</p>
          <Link 
            to="/join/hotel"
            className="inline-block bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-bold transition"
          >
            سجل فندقك مجاناً
          </Link>
        </div>
      </div>
    </div>
  );
};

// Hotel Card Component
const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  
  const stars = '⭐'.repeat(hotel.star_rating || 3);
  
  return (
    <div 
      onClick={() => navigate(`/hotels/${hotel.id}`)}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer group"
    >
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-700 dark:to-gray-600 relative overflow-hidden">
        {hotel.cover_image ? (
          <img 
            src={hotel.cover_image} 
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🏨</div>
        )}
        {hotel.is_featured && (
          <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
            مميز
          </span>
        )}
      </div>
      
      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {hotel.name_ar || hotel.name}
          </h3>
          <span className="text-xs">{stars}</span>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
          <span>📍</span> {hotel.city}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-yellow-500">
            <span>⭐</span>
            <span className="font-semibold">{hotel.rating || 'جديد'}</span>
            {hotel.review_count > 0 && (
              <span className="text-gray-400 text-sm">({hotel.review_count})</span>
            )}
          </div>
          {hotel.min_price > 0 && (
            <div className="text-left">
              <span className="text-xs text-gray-500">يبدأ من</span>
              <p className="font-bold text-purple-600">{hotel.min_price} ر.س/ليلة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hotel Detail Page
export const HotelDetailPage = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    guestName: '',
    guestPhone: '',
    guestEmail: ''
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHotel();
  }, [hotelId]);

  const fetchHotel = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/hotels/${hotelId}`);
      setHotel(res.data);
    } catch (err) {
      console.error('Error fetching hotel:', err);
    }
    setLoading(false);
  };

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login?redirect=/hotels/' + hotelId);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/hotels/bookings`, {
        hotel_id: hotelId,
        room_type_id: selectedRoom.id,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests,
        guest_name: bookingData.guestName,
        guest_phone: bookingData.guestPhone,
        guest_email: bookingData.guestEmail,
        payment_method: 'pay_at_hotel'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('تم الحجز بنجاح! رقم الحجز: ' + res.data.booking.booking_number);
      setShowBookingModal(false);
      navigate('/hotels/bookings');
    } catch (err) {
      alert(err.response?.data?.detail || 'حدث خطأ أثناء الحجز');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin text-6xl">🏨</div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">😔</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">الفندق غير موجود</h2>
          <Link to="/hotels" className="text-purple-500 hover:underline mt-4 block">
            العودة للفنادق
          </Link>
        </div>
      </div>
    );
  }

  const stars = '⭐'.repeat(hotel.star_rating || 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cover Image */}
      <div className="h-80 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-gray-700 dark:to-gray-600 relative">
        {hotel.cover_image && (
          <img src={hotel.cover_image} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <button 
          onClick={() => navigate('/hotels')}
          className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full"
        >
          ➡️
        </button>
      </div>

      {/* Hotel Info */}
      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {hotel.name_ar || hotel.name}
              </h1>
              <p className="text-gray-500 flex items-center gap-2 mt-1">
                <span>📍</span> {hotel.address}
              </p>
            </div>
            <div className="text-left">
              <span className="text-sm">{stars}</span>
              {hotel.rating > 0 && (
                <p className="flex items-center gap-1 text-yellow-500 mt-1">
                  ⭐ <span className="font-bold">{hotel.rating}</span>
                  <span className="text-gray-400 text-sm">({hotel.review_count} تقييم)</span>
                </p>
              )}
            </div>
          </div>

          {/* Facilities */}
          {hotel.facilities && hotel.facilities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {hotel.facilities.map((facility, idx) => (
                <span key={idx} className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-3 py-1 rounded-full text-sm">
                  {facility}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Room Types */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">الغرف المتاحة</h2>
          
          {(!hotel.room_types || hotel.room_types.length === 0) ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
              <span className="text-5xl block mb-4">🛏️</span>
              <p className="text-gray-500">لا توجد غرف متاحة حالياً</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hotel.room_types.map((room) => (
                <div key={room.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex gap-6">
                  <div className="w-48 h-32 bg-purple-100 dark:bg-purple-900/30 rounded-xl overflow-hidden flex-shrink-0">
                    {room.images && room.images[0] ? (
                      <img src={room.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🛏️</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {room.name_ar || room.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {room.description || `${room.beds} • حتى ${room.max_guests} ضيوف`}
                    </p>
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities.slice(0, 4).map((amenity, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-purple-600">{room.price_per_night} ر.س</span>
                        <span className="text-gray-500 text-sm"> / ليلة</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowBookingModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-semibold transition"
                      >
                        احجز الآن
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">إتمام الحجز</h3>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-900 dark:text-white">{selectedRoom.name_ar || selectedRoom.name}</p>
              <p className="text-purple-600 font-bold">{selectedRoom.price_per_night} ر.س / ليلة</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">تاريخ الوصول</label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">تاريخ المغادرة</label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={bookingData.guestName}
                  onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">رقم الجوال</label>
                <input
                  type="tel"
                  value={bookingData.guestPhone}
                  onChange={(e) => setBookingData({...bookingData, guestPhone: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={bookingData.guestEmail}
                  onChange={(e) => setBookingData({...bookingData, guestEmail: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleBooking}
              className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition"
            >
              تأكيد الحجز
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelsPage;
