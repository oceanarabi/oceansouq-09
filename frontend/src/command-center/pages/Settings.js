import React, { useState } from 'react';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'عام', icon: '⚙️' },
    { id: 'branding', label: 'الهوية', icon: '🎨' },
    { id: 'payments', label: 'المدفوعات', icon: '💳' },
    { id: 'notifications', label: 'الإشعارات', icon: '🔔' },
    { id: 'security', label: 'الأمان', icon: '🔒' },
    { id: 'integrations', label: 'التكاملات', icon: '🔗' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الإعدادات</h1>
        <p className="text-gray-600 dark:text-gray-400">إعدادات المنصة المركزية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-right ${
                  activeSection === section.id
                    ? 'bg-ocean-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                <span className="font-semibold">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {activeSection === 'general' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">الإعدادات العامة</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">اسم المنصة</label>
                  <input type="text" defaultValue="Ocean" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">اللغة الافتراضية</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl">
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">المنطقة الزمنية</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl">
                    <option>Asia/Riyadh (UTC+3)</option>
                    <option>Asia/Dubai (UTC+4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">العملة</label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-xl">
                    <option>SAR - ريال سعودي</option>
                    <option>AED - درهم إماراتي</option>
                    <option>USD - دولار أمريكي</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'branding' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">الهوية البصرية</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">الشعار</label>
                  <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-5xl">🌊</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">اللون الرئيسي</label>
                  <div className="flex gap-3">
                    {['#0066CC', '#00CC66', '#CC6600', '#6600CC', '#CC0066'].map((color) => (
                      <button
                        key={color}
                        className="w-10 h-10 rounded-xl border-2 border-white shadow"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'general' && activeSection !== 'branding' && (
            <div className="text-center py-12">
              <span className="text-6xl block mb-4">{sections.find(s => s.id === activeSection)?.icon}</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">إعدادات {sections.find(s => s.id === activeSection)?.label}</h3>
              <p className="text-gray-500">قريباً...</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end gap-4">
            <button className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold">إلغاء</button>
            <button className="px-6 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl font-semibold">حفظ التغييرات</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
