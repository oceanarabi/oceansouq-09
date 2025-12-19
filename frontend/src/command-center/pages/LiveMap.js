import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
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

// Custom icons
const createIcon = (emoji, color = '#3b82f6') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

const icons = {
  driver: createIcon('🚚', '#22c55e'),
  captain: createIcon('🚗', '#3b82f6'),
  restaurant: createIcon('🍔', '#f97316'),
  hotel: createIcon('🏨', '#a855f7'),
  order: createIcon('📦', '#ef4444'),
  service: createIcon('🔧', '#eab308'),
};

// Map Center Controller
const MapCenterController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

const LiveMap = () => {
  const [activeTab, setActiveTab] = useState('all');
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
  const [mapCenter, setMapCenter] = useState([24.7136, 46.6753]); // Riyadh
  const mapRef = useRef(null);

  useEffect(() => {
    fetchMapData();
    // Refresh every 10 seconds
    const interval = setInterval(fetchMapData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMapData = async () => {
    try {
      const token = localStorage.getItem('commandToken');
      const res = await axios.get(`${API_URL}/api/command/live-map`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMapData(res.data.markers || {});
      setStats(res.data.stats || {});
    } catch (err) {
      console.error('Error fetching map data:', err);
      // Use demo data if API fails
      setMapData(generateDemoData());
      setStats({
        onlineDrivers: 12,
        onlineCaptains: 8,
        activeOrders: 45,
        activeRides: 23
      });
    }
    setLoading(false);
  };

  // Generate demo data for visualization
  const generateDemoData = () => {
    const riyadhCenter = { lat: 24.7136, lng: 46.6753 };
    const jeddahCenter = { lat: 21.4858, lng: 39.1925 };
    
    const randomOffset = () => (Math.random() - 0.5) * 0.1;
    
    return {
      drivers: Array.from({ length: 12 }, (_, i) => ({
        id: `driver-${i}`,
        name: `سائق ${i + 1}`,
        lat: riyadhCenter.lat + randomOffset(),
        lng: riyadhCenter.lng + randomOffset(),
        status: Math.random() > 0.3 ? 'available' : 'busy',
        vehicle: ['سيارة', 'دراجة نارية', 'فان'][Math.floor(Math.random() * 3)],
        rating: (4 + Math.random()).toFixed(1),
        deliveries: Math.floor(Math.random() * 500)
      })),
      captains: Array.from({ length: 8 }, (_, i) => ({
        id: `captain-${i}`,
        name: `كابتن ${i + 1}`,
        lat: riyadhCenter.lat + randomOffset(),
        lng: riyadhCenter.lng + randomOffset(),
        status: Math.random() > 0.4 ? 'available' : 'in_ride',
        vehicle: ['كامري', 'اكورد', 'سوناتا'][Math.floor(Math.random() * 3)],
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        rides: Math.floor(Math.random() * 1000)
      })),
      restaurants: [
        { id: 'r1', name: 'البيك', lat: 24.7236, lng: 46.6853, orders: 15, rating: 4.8 },
        { id: 'r2', name: 'كودو', lat: 24.7036, lng: 46.6653, orders: 8, rating: 4.6 },
        { id: 'r3', name: 'ماما نورة', lat: 24.7336, lng: 46.6553, orders: 12, rating: 4.7 },
        { id: 'r4', name: 'هرفي', lat: 24.6936, lng: 46.6953, orders: 6, rating: 4.5 },
      ],
      hotels: [
        { id: 'h1', name: 'ريتز كارلتون', lat: 24.7436, lng: 46.6453, bookings: 45, occupancy: 85 },
        { id: 'h2', name: 'فور سيزونز', lat: 24.7536, lng: 46.6353, bookings: 38, occupancy: 78 },
        { id: 'h3', name: 'ماريوت', lat: 24.6836, lng: 46.7053, bookings: 52, occupancy: 92 },
      ],
      activeOrders: Array.from({ length: 15 }, (_, i) => ({
        id: `order-${i}`,
        orderNumber: `FO-${Date.now()}-${i}`,
        lat: riyadhCenter.lat + randomOffset() * 0.5,
        lng: riyadhCenter.lng + randomOffset() * 0.5,
        status: ['preparing', 'ready', 'delivering'][Math.floor(Math.random() * 3)],
        restaurant: ['البيك', 'كودو', 'ماما نورة'][Math.floor(Math.random() * 3)],
        amount: Math.floor(50 + Math.random() * 150)
      })),
      activeRides: Array.from({ length: 8 }, (_, i) => ({
        id: `ride-${i}`,
        rideNumber: `R-${Date.now()}-${i}`,
        pickupLat: riyadhCenter.lat + randomOffset() * 0.3,
        pickupLng: riyadhCenter.lng + randomOffset() * 0.3,
        dropoffLat: riyadhCenter.lat + randomOffset() * 0.5,
        dropoffLng: riyadhCenter.lng + randomOffset() * 0.5,
        status: ['searching', 'accepted', 'in_progress'][Math.floor(Math.random() * 3)],
        fare: Math.floor(20 + Math.random() * 80)
      })),
      serviceProviders: Array.from({ length: 5 }, (_, i) => ({
        id: `sp-${i}`,
        name: `مقدم خدمة ${i + 1}`,
        lat: riyadhCenter.lat + randomOffset(),
        lng: riyadhCenter.lng + randomOffset(),
        service: ['تنظيف', 'صيانة', 'سباكة'][Math.floor(Math.random() * 3)],
        status: Math.random() > 0.5 ? 'available' : 'busy'
      }))
    };
  };

  const getFilteredMarkers = () => {
    switch (activeTab) {
      case 'drivers':
        return { drivers: mapData.drivers, activeOrders: mapData.activeOrders };
      case 'captains':
        return { captains: mapData.captains, activeRides: mapData.activeRides };
      case 'restaurants':
        return { restaurants: mapData.restaurants };
      case 'hotels':
        return { hotels: mapData.hotels };
      case 'services':
        return { serviceProviders: mapData.serviceProviders };
      default:
        return mapData;
    }
  };

  const filteredData = getFilteredMarkers();

  const statusColors = {
    available: '#22c55e',
    busy: '#ef4444',
    in_ride: '#f97316',
    preparing: '#eab308',
    ready: '#22c55e',
    delivering: '#3b82f6',
    searching: '#a855f7',
    accepted: '#22c55e',
    in_progress: '#3b82f6'
  };

  const statusLabels = {
    available: 'متاح',
    busy: 'مشغول',
    in_ride: 'في رحلة',
    preparing: 'قيد التحضير',
    ready: 'جاهز',
    delivering: 'قيد التوصيل',
    searching: 'يبحث عن كابتن',
    accepted: 'تم القبول',
    in_progress: 'جارية'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🗺️</div>
          <p className="text-gray-400">جارٍ تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="text-3xl">🗺️</span>
            الخريطة الحية
          </h1>
          <p className="text-gray-400 mt-1">تتبع جميع العمليات في الوقت الفعلي</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-3">
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.onlineDrivers}</p>
            <p className="text-xs text-gray-400">سائق متصل</p>
          </div>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.onlineCaptains}</p>
            <p className="text-xs text-gray-400">كابتن متصل</p>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold text-orange-400">{stats.activeOrders}</p>
            <p className="text-xs text-gray-400">طلب نشط</p>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.activeRides}</p>
            <p className="text-xs text-gray-400">رحلة نشطة</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'الكل', icon: '🌐' },
          { id: 'drivers', label: 'سائقي التوصيل', icon: '🚚' },
          { id: 'captains', label: 'الكباتن', icon: '🚗' },
          { id: 'restaurants', label: 'المطاعم', icon: '🍔' },
          { id: 'hotels', label: 'الفنادق', icon: '🏨' },
          { id: 'services', label: 'مقدمي الخدمات', icon: '🔧' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition
              ${activeTab === tab.id 
                ? 'bg-ocean-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3 bg-gray-800 rounded-2xl overflow-hidden h-[600px]">
          <MapContainer
            ref={mapRef}
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterController center={mapCenter} />

            {/* Drivers */}
            {filteredData.drivers?.map((driver) => (
              <Marker
                key={driver.id}
                position={[driver.lat, driver.lng]}
                icon={icons.driver}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'driver', data: driver })
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.vehicle}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs text-white mt-1`}
                      style={{ backgroundColor: statusColors[driver.status] }}>
                      {statusLabels[driver.status]}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Captains */}
            {filteredData.captains?.map((captain) => (
              <Marker
                key={captain.id}
                position={[captain.lat, captain.lng]}
                icon={icons.captain}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'captain', data: captain })
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold">{captain.name}</p>
                    <p className="text-sm text-gray-600">{captain.vehicle}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs text-white mt-1`}
                      style={{ backgroundColor: statusColors[captain.status] }}>
                      {statusLabels[captain.status]}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Restaurants */}
            {filteredData.restaurants?.map((restaurant) => (
              <Marker
                key={restaurant.id}
                position={[restaurant.lat, restaurant.lng]}
                icon={icons.restaurant}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'restaurant', data: restaurant })
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold">{restaurant.name}</p>
                    <p className="text-sm">⭐ {restaurant.rating}</p>
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
                icon={icons.hotel}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'hotel', data: hotel })
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold">{hotel.name}</p>
                    <p className="text-sm">الإشغال: {hotel.occupancy}%</p>
                    <p className="text-sm text-purple-600">{hotel.bookings} حجز</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Active Orders */}
            {filteredData.activeOrders?.map((order) => (
              <Marker
                key={order.id}
                position={[order.lat, order.lng]}
                icon={icons.order}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'order', data: order })
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold text-sm">{order.orderNumber}</p>
                    <p className="text-sm">{order.restaurant}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs text-white mt-1`}
                      style={{ backgroundColor: statusColors[order.status] }}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Service Providers */}
            {filteredData.serviceProviders?.map((sp) => (
              <Marker
                key={sp.id}
                position={[sp.lat, sp.lng]}
                icon={icons.service}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'service', data: sp })
                }}
              >
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold">{sp.name}</p>
                    <p className="text-sm text-gray-600">{sp.service}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs text-white mt-1`}
                      style={{ backgroundColor: statusColors[sp.status] }}>
                      {statusLabels[sp.status]}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Legend */}
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4">
            <h3 className="font-bold text-white mb-3">دليل الرموز</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">🚚</span>
                <span className="text-gray-300">سائق توصيل</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">🚗</span>
                <span className="text-gray-300">كابتن</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">🍔</span>
                <span className="text-gray-300">مطعم</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">🏨</span>
                <span className="text-gray-300">فندق</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">📦</span>
                <span className="text-gray-300">طلب نشط</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">🔧</span>
                <span className="text-gray-300">مقدم خدمة</span>
              </div>
            </div>
          </div>

          {/* Selected Item Details */}
          {selectedItem && (
            <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white">التفاصيل</h3>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {selectedItem.type === 'driver' && (
                <div className="space-y-2 text-sm">
                  <p className="text-lg font-bold text-white">{selectedItem.data.name}</p>
                  <p className="text-gray-400">المركبة: {selectedItem.data.vehicle}</p>
                  <p className="text-gray-400">التقييم: ⭐ {selectedItem.data.rating}</p>
                  <p className="text-gray-400">التوصيلات: {selectedItem.data.deliveries}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs text-white`}
                    style={{ backgroundColor: statusColors[selectedItem.data.status] }}>
                    {statusLabels[selectedItem.data.status]}
                  </span>
                </div>
              )}

              {selectedItem.type === 'captain' && (
                <div className="space-y-2 text-sm">
                  <p className="text-lg font-bold text-white">{selectedItem.data.name}</p>
                  <p className="text-gray-400">السيارة: {selectedItem.data.vehicle}</p>
                  <p className="text-gray-400">التقييم: ⭐ {selectedItem.data.rating}</p>
                  <p className="text-gray-400">الرحلات: {selectedItem.data.rides}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs text-white`}
                    style={{ backgroundColor: statusColors[selectedItem.data.status] }}>
                    {statusLabels[selectedItem.data.status]}
                  </span>
                </div>
              )}

              {selectedItem.type === 'restaurant' && (
                <div className="space-y-2 text-sm">
                  <p className="text-lg font-bold text-white">{selectedItem.data.name}</p>
                  <p className="text-gray-400">التقييم: ⭐ {selectedItem.data.rating}</p>
                  <p className="text-orange-400 font-semibold">{selectedItem.data.orders} طلب نشط</p>
                </div>
              )}

              {selectedItem.type === 'hotel' && (
                <div className="space-y-2 text-sm">
                  <p className="text-lg font-bold text-white">{selectedItem.data.name}</p>
                  <p className="text-gray-400">نسبة الإشغال: {selectedItem.data.occupancy}%</p>
                  <p className="text-purple-400 font-semibold">{selectedItem.data.bookings} حجز</p>
                  <div className="mt-2">
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 rounded-full h-2"
                        style={{ width: `${selectedItem.data.occupancy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {selectedItem.type === 'order' && (
                <div className="space-y-2 text-sm">
                  <p className="text-lg font-bold text-white">{selectedItem.data.orderNumber}</p>
                  <p className="text-gray-400">المطعم: {selectedItem.data.restaurant}</p>
                  <p className="text-gray-400">المبلغ: {selectedItem.data.amount} ر.س</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs text-white`}
                    style={{ backgroundColor: statusColors[selectedItem.data.status] }}>
                    {statusLabels[selectedItem.data.status]}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4">
            <h3 className="font-bold text-white mb-3">إجراءات سريعة</h3>
            <div className="space-y-2">
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm transition">
                📢 إرسال إشعار للسائقين
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition">
                📊 تصدير تقرير
              </button>
              <button 
                onClick={fetchMapData}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition"
              >
                🔄 تحديث البيانات
              </button>
            </div>
          </div>

          {/* City Selector */}
          <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-4">
            <h3 className="font-bold text-white mb-3">تغيير المدينة</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'الرياض', coords: [24.7136, 46.6753] },
                { name: 'جدة', coords: [21.4858, 39.1925] },
                { name: 'مكة', coords: [21.4225, 39.8262] },
                { name: 'الدمام', coords: [26.4207, 50.0888] },
              ].map((city) => (
                <button
                  key={city.name}
                  onClick={() => setMapCenter(city.coords)}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
