import React, { useState } from 'react';
import { useServices, ALL_SERVICES } from '../CommandCenterApp';

const ServicesManager = () => {
  const { services, toggleService } = useServices();
  const [loading, setLoading] = useState({});

  const handleToggle = async (serviceId, currentState) => {
    setLoading(prev => ({ ...prev, [serviceId]: true }));
    await toggleService(serviceId, !currentState);
    setLoading(prev => ({ ...prev, [serviceId]: false }));
  };

  const serviceDetails = {
    shopping: {
      description: 'إدارة المتاجر والمنتجات والطلبات',
      features: ['إدارة البائعين', 'إدارة المنتجات', 'إدارة الطلبات', 'التقييمات والمراجعات'],
      stats: { stores: 245, products: 12500, orders: 8543 }
    },
    delivery: {
      description: 'إدارة التوصيل والسائقين',
      features: ['تتبع مباشر', 'إدارة السائقين', 'مناطق التوصيل', 'رسوم التوصيل'],
      stats: { drivers: 342, deliveries: 5200, zones: 15 }
    },
    food: {
      description: 'إدارة المطاعم وطلبات الطعام',
      features: ['إدارة المطاعم', 'القوائم والأصناف', 'العروض الخاصة', 'تقييمات الطعام'],
      stats: { restaurants: 180, items: 4500, orders: 3200 }
    },
    rides: {
      description: 'إدارة المشاوير والكباتن',
      features: ['إدارة الكباتن', 'أنواع السيارات', 'التسعير الديناميكي', 'تتبع الرحلات'],
      stats: { captains: 150, rides: 2800, cities: 8 }
    },
    hotels: {
      description: 'إدارة الفنادق والحجوزات',
      features: ['إدارة الفنادق', 'الغرف والأجنحة', 'العروض الموسمية', 'إدارة الحجوزات'],
      stats: { hotels: 85, rooms: 2400, bookings: 1200 }
    },
    experiences: {
      description: 'إدارة الأنشطة والتجارب السياحية',
      features: ['الفعاليات', 'الجولات السياحية', 'التذاكر', 'المرشدين'],
      stats: { activities: 120, tickets: 3500, guides: 45 }
    },
    ondemand: {
      description: 'إدارة الخدمات اليومية عند الطلب',
      features: ['تنظيف', 'صيانة', 'سباكة وكهرباء', 'غسيل سيارات'],
      stats: { providers: 280, services: 45, requests: 1800 }
    },
    subscriptions: {
      description: 'إدارة الاشتراكات والباقات',
      features: ['باقات VIP', 'خصومات حصرية', 'توصيل مجاني', 'نقاط المكافآت'],
      stats: { subscribers: 5200, plans: 4, revenue: 250000 }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">إدارة الخدمات</h1>
        <p className="text-gray-600 dark:text-gray-400">تفعيل وإيقاف الخدمات والتحكم في إعداداتها</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ALL_SERVICES.map((service) => {
          const isEnabled = services.find(s => s.id === service.id)?.enabled || false;
          const details = serviceDetails[service.id];
          const isLoading = loading[service.id];

          return (
            <div 
              key={service.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 transition ${
                isEnabled ? 'border-green-500' : 'border-transparent'
              }`}
            >
              {/* Header */}
              <div className={`p-6 ${isEnabled ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' : 'bg-gray-50 dark:bg-gray-900'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${isEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{service.nameEn}</p>
                    </div>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(service.id, isEnabled)}
                    disabled={isLoading}
                    className={`relative w-16 h-8 rounded-full transition-colors ${isEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'} ${isLoading ? 'opacity-50' : ''}`}
                  >
                    <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${isEnabled ? 'right-1' : 'left-1'}`}>
                      {isLoading && <span className="absolute inset-0 flex items-center justify-center text-xs">⏳</span>}
                    </span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">{details.description}</p>
                
                {/* Features */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">المميزات:</p>
                  <div className="flex flex-wrap gap-2">
                    {details.features.map((feature, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                  {Object.entries(details.stats).map(([key, value], idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                      <p className="text-xs text-gray-500">{key}</p>
                    </div>
                  ))}
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    isEnabled 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    {isEnabled ? 'الخدمة نشطة' : 'الخدمة معطلة'}
                  </span>
                  
                  <button className="text-ocean-600 hover:text-ocean-700 text-sm font-semibold">
                    إعدادات متقدمة →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesManager;
