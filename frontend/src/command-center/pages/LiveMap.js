import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Shopify-style custom icons with pulse animation
const createIcon = (emoji, color = '#3b82f6', isActive = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative;">
        ${isActive ? `<div style="
          position: absolute;
          width: 50px;
          height: 50px;
          background: ${color}40;
          border-radius: 50%;
          top: -5px;
          left: -5px;
          animation: pulse 2s infinite;
        "></div>` : ''}
        <div style="
          background: ${color};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          border: 3px solid white;
          box-shadow: 0 4px 15px ${color}60;
          position: relative;
          z-index: 1;
        ">${emoji}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const icons = {
  driver: (status) => createIcon('🚚', status === 'available' ? '#22c55e' : '#ef4444', status === 'busy'),
  captain: (status) => createIcon('🚗', status === 'available' ? '#3b82f6' : '#f97316', status === 'in_ride'),
  restaurant: () => createIcon('🍔', '#f97316', true),
  hotel: () => createIcon('🏨', '#a855f7', false),
  order: (status) => createIcon('📦', status === 'delivering' ? '#22c55e' : '#ef4444', true),
  service: (status) => createIcon('🔧', status === 'available' ? '#eab308' : '#6b7280', false),
};

// Map auto-center controller
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1 });
    }
  }, [center, zoom, map]);
  return null;
};

// Animated stats card component
const StatCard = ({ icon, value, label, trend, color, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
      isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
    }`}
    style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)` }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-300 mt-1">{label}</p>
      </div>
      <div className="text-4xl opacity-80">{icon}</div>
    </div>
    {trend && (
      <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full ${
        trend > 0 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
      }`}>
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    )}
    <div 
      className="absolute inset-0 opacity-10"
      style={{ background: `radial-gradient(circle at top right, ${color}, transparent)` }}
    />
  </button>
);

// Live indicator component
const LiveIndicator = ({ lastUpdate, isRefreshing }) => (
  <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur rounded-full px-4 py-2">
    <span className={`w-3 h-3 rounded-full ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></span>
    <span className="text-sm text-gray-300">
      {isRefreshing ? 'جارٍ التحديث...' : `مباشر • آخر تحديث: ${lastUpdate}`}
    </span>
  </div>
);

// Details panel component (Shopify-style slide-out)
const DetailsPanel = ({ item, onClose }) => {
  if (!item) return null;

  const statusColors = {
    available: '#22c55e',
    busy: '#ef4444',
    in_ride: '#f97316',
    preparing: '#eab308',
    ready: '#22c55e',
    delivering: '#3b82f6',
  };

  const statusLabels = {
    available: 'متاح',
    busy: 'مشغول',
    in_ride: 'في رحلة',
    preparing: 'قيد التحضير',
    ready: 'جاهز',
    delivering: 'قيد التوصيل',
  };

  return (
    <div className="absolute top-0 left-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 z-[1000] animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">التفاصيل</h3>
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Avatar/Icon */}
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: `${statusColors[item.data?.status] || '#3b82f6'}30` }}
          >
            {item.type === 'driver' && '🚚'}
            {item.type === 'captain' && '🚗'}
            {item.type === 'restaurant' && '🍔'}
            {item.type === 'hotel' && '🏨'}
            {item.type === 'order' && '📦'}
            {item.type === 'service' && '🔧'}
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">{item.data?.name || item.data?.orderNumber}</h4>
            {item.data?.status && (
              <span 
                className="inline-block mt-1 px-3 py-1 rounded-full text-xs text-white"
                style={{ backgroundColor: statusColors[item.data.status] }}
              >
                {statusLabels[item.data.status] || item.data.status}
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          {item.type === 'driver' && (
            <>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-400">المركبة</p>
                <p className="text-white font-medium">{item.data?.vehicle}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-400">التقييم</p>
                <p className="text-white font-medium">⭐ {item.data?.rating}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400">إجمالي التوصيلات</p>
                <p className="text-2xl font-bold text-white">{item.data?.deliveries}</p>
              </div>
            </>
          )}
          {item.type === 'captain' && (
            <>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-400">السيارة</p>
                <p className="text-white font-medium">{item.data?.vehicle}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-400">التقييم</p>
                <p className="text-white font-medium">⭐ {item.data?.rating}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400">إجمالي الرحلات</p>
                <p className="text-2xl font-bold text-white">{item.data?.rides}</p>
              </div>
            </>
          )}
          {item.type === 'restaurant' && (
            <>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-400">التقييم</p>
                <p className="text-white font-medium">⭐ {item.data?.rating}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <p className="text-xs text-gray-400">طلبات نشطة</p>
                <p className="text-white font-medium text-orange-400">{item.data?.orders}</p>
              </div>
            </>
          )}
          {item.type === 'hotel' && (
            <>
              <div className="bg-gray-800/50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400 mb-2">نسبة الإشغال</p>
                <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all"
                    style={{ width: `${item.data?.occupancy}%` }}
                  />
                </div>
                <p className="text-white font-bold mt-1">{item.data?.occupancy}%</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400">الحجوزات</p>
                <p className="text-2xl font-bold text-purple-400">{item.data?.bookings}</p>
              </div>
            </>
          )}
          {item.type === 'order' && (
            <>
              <div className="bg-gray-800/50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400">المطعم</p>
                <p className="text-white font-medium">{item.data?.restaurant}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400">المبلغ</p>
                <p className="text-2xl font-bold text-green-400">{item.data?.amount} ر.س</p>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4">
          <button className="w-full bg-ocean-600 hover:bg-ocean-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
            <span>📞</span>
            تواصل
          </button>
          <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
            <span>📍</span>
            تتبع الموقع
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveMap = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [mapData, setMapData] = useState({
    drivers: [],
    captains: [],
    restaurants: [],
    hotels: [],
    activeOrders: [],
    activeRides: [],
    serviceProviders: []
  });
  const [stats, setStats] = useState({
    onlineDrivers: 0,
    onlineCaptains: 0,
    activeOrders: 0,
    activeRides: 0
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('--:--');
  const [mapCenter, setMapCenter] = useState([24.7136, 46.6753]);
  const [mapZoom, setMapZoom] = useState(12);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedCity, setSelectedCity] = useState('الرياض');

  // Handle city change - update map center and refetch data
  const handleCityChange = (city) => {
    setSelectedCity(city.name);
    setMapCenter(city.coords);
    setMapZoom(12);
    fetchMapData(city.coords);
  };

  const fetchMapData = useCallback(async (cityCoords = null) => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('commandToken');
      const res = await axios.get(`${API_URL}/api/command/live-map`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMapData(res.data.markers || {});
      setStats(res.data.stats || {});
      setLastUpdate(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error fetching map data:', err);
    }
    setLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 15000);
    return () => clearInterval(interval);
  }, [fetchMapData]);

  const getFilteredMarkers = () => {
    switch (activeFilter) {
      case 'drivers':
        return { drivers: mapData.drivers, activeOrders: mapData.activeOrders };
      case 'captains':
        return { captains: mapData.captains };
      case 'restaurants':
        return { restaurants: mapData.restaurants };
      case 'hotels':
        return { hotels: mapData.hotels };
      case 'services':
        return { serviceProviders: mapData.serviceProviders };
      case 'orders':
        return { activeOrders: mapData.activeOrders };
      default:
        return mapData;
    }
  };

  const filteredData = getFilteredMarkers();

  const cities = [
    { name: 'الرياض', coords: [24.7136, 46.6753], icon: '🏛️' },
    { name: 'جدة', coords: [21.4858, 39.1925], icon: '🌊' },
    { name: 'مكة', coords: [21.4225, 39.8262], icon: '🕋' },
    { name: 'الدمام', coords: [26.4207, 50.0888], icon: '🏭' },
    { name: 'المدينة', coords: [24.5247, 39.5692], icon: '🕌' },
  ];

  const filters = [
    { id: 'all', label: 'الكل', icon: '🌐', count: Object.values(mapData).flat().length },
    { id: 'drivers', label: 'السائقين', icon: '🚚', count: mapData.drivers?.length || 0 },
    { id: 'captains', label: 'الكباتن', icon: '🚗', count: mapData.captains?.length || 0 },
    { id: 'orders', label: 'الطلبات', icon: '📦', count: mapData.activeOrders?.length || 0 },
    { id: 'restaurants', label: 'المطاعم', icon: '🍔', count: mapData.restaurants?.length || 0 },
    { id: 'hotels', label: 'الفنادق', icon: '🏨', count: mapData.hotels?.length || 0 },
    { id: 'services', label: 'الخدمات', icon: '🔧', count: mapData.serviceProviders?.length || 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-ocean-600/30 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-4 border-transparent border-t-ocean-600 rounded-full animate-spin"></div>
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">🗺️</span>
          </div>
          <p className="text-gray-400 mt-6 text-lg">جارٍ تحميل الخريطة الحية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        .leaflet-container {
          background: #0f172a;
        }
      `}</style>

      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-ocean-700 rounded-2xl flex items-center justify-center shadow-lg shadow-ocean-600/30">
              <span className="text-2xl">🗺️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">الخريطة الحية</h1>
              <p className="text-gray-400 text-sm">تتبع جميع العمليات في الوقت الفعلي</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LiveIndicator lastUpdate={lastUpdate} isRefreshing={isRefreshing} />
            <button 
              onClick={fetchMapData}
              disabled={isRefreshing}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
              تحديث
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard 
            icon="🚚" 
            value={stats.onlineDrivers} 
            label="سائق متصل" 
            trend={12}
            color="#22c55e"
            onClick={() => setActiveFilter('drivers')}
            isActive={activeFilter === 'drivers'}
          />
          <StatCard 
            icon="🚗" 
            value={stats.onlineCaptains} 
            label="كابتن متصل" 
            trend={8}
            color="#3b82f6"
            onClick={() => setActiveFilter('captains')}
            isActive={activeFilter === 'captains'}
          />
          <StatCard 
            icon="📦" 
            value={stats.activeOrders} 
            label="طلب نشط" 
            trend={-3}
            color="#f97316"
            onClick={() => setActiveFilter('orders')}
            isActive={activeFilter === 'orders'}
          />
          <StatCard 
            icon="🚀" 
            value={stats.activeRides} 
            label="رحلة جارية" 
            trend={15}
            color="#a855f7"
            onClick={() => setActiveFilter('captains')}
            isActive={false}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-gray-900/95 backdrop-blur border-l border-gray-800 transition-all duration-300 flex flex-col z-10`}>
          {/* Collapse Toggle */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -left-3 top-4 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition z-20"
          >
            {sidebarCollapsed ? '←' : '→'}
          </button>

          {/* Filters */}
          <div className="p-4 border-b border-gray-800">
            {!sidebarCollapsed && <p className="text-xs text-gray-500 mb-3">فلتر العرض</p>}
            <div className="space-y-1">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                    activeFilter === filter.id 
                      ? 'bg-ocean-600 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{filter.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-right text-sm">{filter.label}</span>
                      <span className="text-xs bg-gray-700/50 px-2 py-0.5 rounded-full">{filter.count}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cities */}
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-800">
              <p className="text-xs text-gray-500 mb-3">المدن</p>
              <div className="grid grid-cols-2 gap-2">
                {cities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      setMapCenter(city.coords);
                      setMapZoom(12);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm transition"
                  >
                    <span>{city.icon}</span>
                    <span>{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          {!sidebarCollapsed && (
            <div className="p-4 flex-1">
              <p className="text-xs text-gray-500 mb-3">دليل الألوان</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm text-gray-400">متاح</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="text-sm text-gray-400">مشغول</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-sm text-gray-400">غير متاح</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-sm text-gray-400">في رحلة/توصيل</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-800">
              <button className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 mb-2">
                <span>📢</span>
                إرسال إشعار
              </button>
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2">
                <span>📊</span>
                تصدير تقرير
              </button>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* Drivers */}
            {filteredData.drivers?.map((driver) => (
              <Marker
                key={driver.id}
                position={[driver.lat, driver.lng]}
                icon={icons.driver(driver.status)}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'driver', data: driver })
                }}
              >
                <Popup className="custom-popup">
                  <div className="text-center p-1">
                    <p className="font-bold text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.vehicle}</p>
                    <p className="text-xs text-gray-500">⭐ {driver.rating}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Captains */}
            {filteredData.captains?.map((captain) => (
              <Marker
                key={captain.id}
                position={[captain.lat, captain.lng]}
                icon={icons.captain(captain.status)}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'captain', data: captain })
                }}
              >
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold text-gray-900">{captain.name}</p>
                    <p className="text-sm text-gray-600">{captain.vehicle}</p>
                    <p className="text-xs text-gray-500">⭐ {captain.rating}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Restaurants */}
            {filteredData.restaurants?.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={[restaurant.lat, restaurant.lng]}
                icon={icons.restaurant()}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'restaurant', data: restaurant })
                }}
              >
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold text-gray-900">{restaurant.name}</p>
                    <p className="text-sm text-orange-600">{restaurant.orders} طلب نشط</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Hotels */}
            {filteredData.hotels?.map((hotel) => (
              <Marker
                key={hotel.id}
                position={[hotel.lat, hotel.lng]}
                icon={icons.hotel()}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'hotel', data: hotel })
                }}
              >
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold text-gray-900">{hotel.name}</p>
                    <p className="text-sm text-purple-600">إشغال: {hotel.occupancy}%</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Active Orders */}
            {filteredData.activeOrders?.map((order) => (
              <Marker
                key={order.id}
                position={[order.lat, order.lng]}
                icon={icons.order(order.status)}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'order', data: order })
                }}
              >
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.restaurant}</p>
                    <p className="text-xs text-green-600">{order.amount} ر.س</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Service Providers */}
            {filteredData.serviceProviders?.map((sp) => (
              <Marker
                key={sp.id}
                position={[sp.lat, sp.lng]}
                icon={icons.service(sp.status)}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'service', data: sp })
                }}
              >
                <Popup>
                  <div className="text-center p-1">
                    <p className="font-bold text-gray-900">{sp.name}</p>
                    <p className="text-sm text-gray-600">{sp.service}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Details Panel */}
          <DetailsPanel item={selectedItem} onClose={() => setSelectedItem(null)} />

          {/* Zoom Controls */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
            <button 
              onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
              className="w-10 h-10 bg-gray-800/90 hover:bg-gray-700 rounded-xl flex items-center justify-center text-white transition shadow-lg"
            >
              +
            </button>
            <button 
              onClick={() => setMapZoom(prev => Math.max(prev - 1, 5))}
              className="w-10 h-10 bg-gray-800/90 hover:bg-gray-700 rounded-xl flex items-center justify-center text-white transition shadow-lg"
            >
              −
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
