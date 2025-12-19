import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const fetchData = async () => {
    try {
      const [typesRes, servicesRes] = await Promise.all([
        axios.get(`${API_URL}/api/services/types`),
        axios.get(`${API_URL}/api/services/`, { params: { type: selectedType || undefined } })
      ]);
      setTypes(typesRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const handleBook = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-bounce text-6xl">🔧</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🔧 الخدمات المنزلية</h1>
          <p className="text-lg text-white/90">احصل على الخدمة التي تحتاجها في موقعك</p>
        </div>
      </div>

      {/* Types Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedType('')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition
              ${!selectedType ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            الكل
          </button>
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition flex items-center gap-2
                ${selectedType === type.id ? 'bg-amber-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >
              <span>{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 pb-12">
        {services.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <span className="text-6xl block mb-4">🔧</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لا توجد خدمات حالياً</h3>
            <p className="text-gray-500">ترقبوا خدمات جديدة قريباً!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-2xl">
                    {types.find(t => t.id === service.service_type)?.icon || '🔧'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{service.name_ar}</h3>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mb-4 text-sm">
                  <span className="flex items-center gap-1 text-yellow-500">
                    ⭐ {service.rating}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500">{service.total_jobs} طلب</span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                  <div>
                    <span className="text-2xl font-bold text-amber-500">{service.base_price}</span>
                    <span className="text-gray-500 text-sm">
                      {service.price_type === 'hourly' ? ' ر.س/ساعة' : ' ر.س'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleBook(service)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-semibold transition"
                  >
                    احجز الآن
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">🔧 هل أنت مقدم خدمات؟</h2>
          <p className="mb-6 text-white/90">انضم إلينا واحصل على عملاء جدد</p>
          <Link to="/join/service-provider" className="inline-block bg-white text-amber-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
            سجل كمقدم خدمات
          </Link>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <BookingModal service={selectedService} onClose={() => setShowBookingModal(false)} />
      )}
    </div>
  );
};

const BookingModal = ({ service, onClose }) => {
  const [formData, setFormData] = useState({
    scheduled_date: '',
    scheduled_time: '',
    address: '',
    phone: '',
    hours: 2,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/services/bookings`, {
        service_id: service.id,
        ...formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('تم حجز الخدمة بنجاح!');
      onClose();
    } catch (err) {
      alert(err.response?.data?.detail || 'حدث خطأ');
    }
    setLoading(false);
  };

  const totalPrice = service.price_type === 'hourly' 
    ? service.base_price * formData.hours 
    : service.base_price;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">حجز {service.name_ar}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">التاريخ</label>
            <input
              type="date"
              required
              value={formData.scheduled_date}
              onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">الوقت</label>
            <input
              type="time"
              required
              value={formData.scheduled_time}
              onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl dark:text-white"
            />
          </div>
          {service.price_type === 'hourly' && (
            <div>
              <label className="block text-sm text-gray-500 mb-1">عدد الساعات</label>
              <select
                value={formData.hours}
                onChange={(e) => setFormData({...formData, hours: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl dark:text-white"
              >
                {[2,3,4,5,6,7,8].map(h => (
                  <option key={h} value={h}>{h} ساعات</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-500 mb-1">العنوان</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl dark:text-white"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">رقم الجوال</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl dark:text-white"
            />
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
            <div className="flex justify-between text-lg font-bold">
              <span>الإجمالي</span>
              <span className="text-amber-600">{totalPrice} ر.س</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {loading ? 'جارٍ الحجز...' : 'تأكيد الحجز'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServicesPage;
