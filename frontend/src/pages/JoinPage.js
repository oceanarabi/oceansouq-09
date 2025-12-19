import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Available Services Page
export const JoinPage = () => {
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableServices();
  }, []);

  const fetchAvailableServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/join/available-services`);
      setServices(res.data.available_services || []);
      setAllServices(res.data.all_services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-ocean-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">انضم إلى Ocean</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            كن جزءاً من أكبر منصة للخدمات المتكاملة. سجل الآن وابدأ رحلتك في النجاح
          </p>
        </div>
      </div>

      {/* Available Services */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          الخدمات المتاحة للتسجيل
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group cursor-pointer"
              onClick={() => navigate(service.route)}
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-ocean-100 dark:bg-ocean-900/30 rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {service.description}
                </p>
                
                {/* Requirements */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">المتطلبات:</p>
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    {service.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="w-full mt-6 bg-ocean-600 hover:bg-ocean-700 text-white py-3 rounded-xl font-semibold transition">
                  سجل الآن
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Services */}
        {allServices.filter(s => !s.enabled).length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              قريباً...
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {allServices.filter(s => !s.enabled).map((service) => (
                <div 
                  key={service.id}
                  className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 text-center opacity-60"
                >
                  <span className="text-3xl block mb-2">{service.icon}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{service.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            لماذا تنضم إلينا؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: '💰', title: 'دخل إضافي', desc: 'اربح دخل إضافي بمرونة تامة وبدون التزامات' },
              { icon: '📱', title: 'تطبيق سهل', desc: 'إدارة عملك من تطبيق واحد بكل سهولة' },
              { icon: '🔒', title: 'دفع آمن', desc: 'استلم مستحقاتك بشكل منتظم وآمن' },
            ].map((benefit, idx) => (
              <div key={idx} className="text-center">
                <span className="text-5xl block mb-4">{benefit.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Registration Form Component
const RegistrationForm = ({ type, title, icon, fields, endpoint }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);
      setSuccess(true);
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'حدث خطأ أثناء التسجيل');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-7xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">تم التسجيل بنجاح!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            سيتم مراجعة طلبك والتواصل معك قريباً
          </p>
          <Link to="/" className="text-ocean-600 hover:text-ocean-700 font-semibold">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-white to-ocean-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-ocean-100 dark:bg-ocean-900/30 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-4">
              {icon}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400">أدخل بياناتك للتسجيل</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => (
                <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:text-white"
                    >
                      <option value="">اختر...</option>
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      rows={3}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:text-white"
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:text-white"
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-ocean-600 hover:bg-ocean-700 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 transition"
            >
              {loading ? 'جارٍ التسجيل...' : 'إرسال الطلب'}
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              بالتسجيل، أنت توافق على <Link to="/terms" className="text-ocean-600">الشروط والأحكام</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

// Seller Registration
export const JoinSellerPage = () => (
  <RegistrationForm
    type="seller"
    title="انضم كبائع"
    icon="🏪"
    endpoint="/api/join/seller"
    fields={[
      { name: 'name', label: 'الاسم الكامل', required: true },
      { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
      { name: 'password', label: 'كلمة المرور', type: 'password', required: true },
      { name: 'phone', label: 'رقم الجوال', required: true },
      { name: 'store_name', label: 'اسم المتجر', required: true },
      { name: 'store_name_ar', label: 'اسم المتجر بالعربي' },
      { name: 'business_type', label: 'نوع النشاط', type: 'select', required: true, options: [
        { value: 'individual', label: 'فردي' },
        { value: 'company', label: 'شركة / مؤسسة' }
      ]},
      { name: 'category', label: 'فئة المنتجات', type: 'select', required: true, options: [
        { value: 'electronics', label: 'إلكترونيات' },
        { value: 'fashion', label: 'أزياء' },
        { value: 'home', label: 'المنزل والمطبخ' },
        { value: 'beauty', label: 'الجمال والعناية' },
        { value: 'sports', label: 'رياضة' },
        { value: 'other', label: 'أخرى' }
      ]},
      { name: 'address', label: 'العنوان', fullWidth: true, required: true },
      { name: 'commercial_register', label: 'رقم السجل التجاري (اختياري)' }
    ]}
  />
);

// Driver Registration  
export const JoinDriverPage = () => (
  <RegistrationForm
    type="driver"
    title="انضم كسائق توصيل"
    icon="🚚"
    endpoint="/api/join/driver"
    fields={[
      { name: 'name', label: 'الاسم الكامل', required: true },
      { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
      { name: 'password', label: 'كلمة المرور', type: 'password', required: true },
      { name: 'phone', label: 'رقم الجوال', required: true },
      { name: 'id_number', label: 'رقم الهوية الوطنية', required: true },
      { name: 'license_number', label: 'رقم رخصة القيادة', required: true },
      { name: 'vehicle_type', label: 'نوع المركبة', type: 'select', required: true, options: [
        { value: 'car', label: 'سيارة' },
        { value: 'motorcycle', label: 'دراجة نارية' },
        { value: 'bicycle', label: 'دراجة هوائية' }
      ]},
      { name: 'vehicle_model', label: 'موديل المركبة' },
      { name: 'vehicle_plate', label: 'رقم اللوحة' },
      { name: 'city', label: 'المدينة', required: true }
    ]}
  />
);

// Restaurant Registration
export const JoinRestaurantPage = () => (
  <RegistrationForm
    type="restaurant"
    title="سجل مطعمك"
    icon="🍔"
    endpoint="/api/join/restaurant"
    fields={[
      { name: 'owner_name', label: 'اسم المالك', required: true },
      { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
      { name: 'password', label: 'كلمة المرور', type: 'password', required: true },
      { name: 'phone', label: 'رقم الجوال', required: true },
      { name: 'restaurant_name', label: 'اسم المطعم', required: true },
      { name: 'restaurant_name_ar', label: 'اسم المطعم بالعربي' },
      { name: 'cuisine_type', label: 'نوع المطبخ', type: 'select', required: true, options: [
        { value: 'fast_food', label: 'وجبات سريعة' },
        { value: 'arabic', label: 'مأكولات عربية' },
        { value: 'asian', label: 'مأكولات آسيوية' },
        { value: 'italian', label: 'مأكولات إيطالية' },
        { value: 'indian', label: 'مأكولات هندية' },
        { value: 'seafood', label: 'مأكولات بحرية' },
        { value: 'coffee', label: 'قهوة ومشروبات' },
        { value: 'desserts', label: 'حلويات' }
      ]},
      { name: 'address', label: 'عنوان المطعم', fullWidth: true, required: true },
      { name: 'commercial_register', label: 'رقم السجل التجاري' }
    ]}
  />
);

// Captain Registration (Rides)
export const JoinCaptainPage = () => (
  <RegistrationForm
    type="captain"
    title="انضم ككابتن"
    icon="🚗"
    endpoint="/api/join/captain"
    fields={[
      { name: 'name', label: 'الاسم الكامل', required: true },
      { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
      { name: 'password', label: 'كلمة المرور', type: 'password', required: true },
      { name: 'phone', label: 'رقم الجوال', required: true },
      { name: 'id_number', label: 'رقم الهوية الوطنية', required: true },
      { name: 'license_number', label: 'رقم رخصة القيادة', required: true },
      { name: 'vehicle_type', label: 'نوع السيارة', type: 'select', required: true, options: [
        { value: 'sedan', label: 'سيدان' },
        { value: 'suv', label: 'SUV' },
        { value: 'luxury', label: 'فاخرة' }
      ]},
      { name: 'vehicle_model', label: 'موديل السيارة', required: true },
      { name: 'vehicle_plate', label: 'رقم اللوحة', required: true },
      { name: 'city', label: 'المدينة', required: true }
    ]}
  />
);

// Hotel Registration
export const JoinHotelPage = () => (
  <RegistrationForm
    type="hotel"
    title="سجل فندقك"
    icon="🏨"
    endpoint="/api/join/hotel"
    fields={[
      { name: 'manager_name', label: 'اسم المدير', required: true },
      { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
      { name: 'password', label: 'كلمة المرور', type: 'password', required: true },
      { name: 'phone', label: 'رقم الجوال', required: true },
      { name: 'hotel_name', label: 'اسم الفندق', required: true },
      { name: 'hotel_name_ar', label: 'اسم الفندق بالعربي' },
      { name: 'star_rating', label: 'تصنيف النجوم', type: 'select', required: true, options: [
        { value: '1', label: '⭐ نجمة واحدة' },
        { value: '2', label: '⭐⭐ نجمتان' },
        { value: '3', label: '⭐⭐⭐ 3 نجوم' },
        { value: '4', label: '⭐⭐⭐⭐ 4 نجوم' },
        { value: '5', label: '⭐⭐⭐⭐⭐ 5 نجوم' }
      ]},
      { name: 'city', label: 'المدينة', required: true },
      { name: 'address', label: 'العنوان', fullWidth: true, required: true },
      { name: 'total_rooms', label: 'عدد الغرف', type: 'number', required: true },
      { name: 'commercial_register', label: 'رقم السجل التجاري' }
    ]}
  />
);

// Service Provider Registration
export const JoinServiceProviderPage = () => (
  <RegistrationForm
    type="service_provider"
    title="انضم كمقدم خدمات"
    icon="🔧"
    endpoint="/api/join/service-provider"
    fields={[
      { name: 'name', label: 'الاسم الكامل', required: true },
      { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
      { name: 'password', label: 'كلمة المرور', type: 'password', required: true },
      { name: 'phone', label: 'رقم الجوال', required: true },
      { name: 'company_name', label: 'اسم الشركة (اختياري)' },
      { name: 'service_type', label: 'نوع الخدمة', type: 'select', required: true, options: [
        { value: 'cleaning', label: 'تنظيف' },
        { value: 'maintenance', label: 'صيانة عامة' },
        { value: 'plumbing', label: 'سباكة' },
        { value: 'electrical', label: 'كهرباء' },
        { value: 'car_wash', label: 'غسيل سيارات' },
        { value: 'ac_maintenance', label: 'صيانة مكيفات' },
        { value: 'moving', label: 'نقل عفش' }
      ]},
      { name: 'experience_years', label: 'سنوات الخبرة', type: 'number' },
      { name: 'city', label: 'المدينة', required: true }
    ]}
  />
);

// Experience Provider Registration
export const JoinExperiencePage = () => (
  <RegistrationForm
    type="experience"
    title="قدم تجارب وأنشطة"
    icon="🎭"
    endpoint="/api/join/experience"
    fields={[
      { name: 'name', label: 'الاسم الكامل', required: true },
      { name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true },
      { name: 'password', label: 'كلمة المرور', type: 'password', required: true },
      { name: 'phone', label: 'رقم الجوال', required: true },
      { name: 'company_name', label: 'اسم الشركة (اختياري)' },
      { name: 'experience_type', label: 'نوع التجربة', type: 'select', required: true, options: [
        { value: 'tours', label: 'جولات سياحية' },
        { value: 'activities', label: 'أنشطة ترفيهية' },
        { value: 'events', label: 'فعاليات' },
        { value: 'workshops', label: 'ورش عمل' },
        { value: 'adventure', label: 'مغامرات' }
      ]},
      { name: 'description', label: 'وصف الخدمات', type: 'textarea', fullWidth: true, required: true, placeholder: 'اشرح نوع التجارب والأنشطة التي تقدمها...' },
      { name: 'city', label: 'المدينة', required: true },
      { name: 'license_number', label: 'رقم الترخيص (إن وجد)' }
    ]}
  />
);

export default JoinPage;
