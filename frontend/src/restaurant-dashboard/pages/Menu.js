import React, { useState } from 'react';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = [
    { id: 'all', name: 'الكل', icon: '🍽️' },
    { id: 'burgers', name: 'برجر', icon: '🍔' },
    { id: 'pizza', name: 'بيتزا', icon: '🍕' },
    { id: 'shawarma', name: 'شاورما', icon: '🌯' },
    { id: 'drinks', name: 'مشروبات', icon: '🧃' },
  ];

  const menuItems = [
    { id: 1, name: 'برجر دجاج', category: 'burgers', price: 25, available: true, image: '🍔' },
    { id: 2, name: 'برجر لحم', category: 'burgers', price: 30, available: true, image: '🍔' },
    { id: 3, name: 'بيتزا مارجريتا', category: 'pizza', price: 45, available: true, image: '🍕' },
    { id: 4, name: 'بيتزا بيبروني', category: 'pizza', price: 55, available: false, image: '🍕' },
    { id: 5, name: 'شاورما لحم', category: 'shawarma', price: 18, available: true, image: '🌯' },
    { id: 6, name: 'شاورما دجاج', category: 'shawarma', price: 15, available: true, image: '🌯' },
    { id: 7, name: 'كولا', category: 'drinks', price: 5, available: true, image: '🧃' },
    { id: 8, name: 'عصير برتقال', category: 'drinks', price: 8, available: true, image: '🧃' },
  ];

  const [items, setItems] = useState(menuItems);

  const filteredItems = activeCategory === 'all' ? items : items.filter(item => item.category === activeCategory);

  const toggleAvailability = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, available: !item.available } : item));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">قائمة الطعام</h1>
          <p className="text-gray-500">إدارة أصناف المطعم</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition flex items-center gap-2"
        >
          <span>+</span>
          إضافة صنف جديد
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${
              activeCategory === cat.id
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transition ${
            !item.available ? 'opacity-60' : ''
          }`}>
            <div className="text-center mb-4">
              <span className="text-6xl">{item.image}</span>
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white text-center">{item.name}</h3>
            <p className="text-center text-green-600 font-bold mt-2">{item.price} ر.س</p>
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => toggleAvailability(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  item.available
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {item.available ? '✓ متاح' : '✗ غير متاح'}
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <span>✏️</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">إضافة صنف جديد</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">اسم الصنف</label>
                <input type="text" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">التصنيف</label>
                <select className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600">
                  {categories.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">السعر (ر.س)</label>
                <input type="number" className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl">
                  إضافة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
