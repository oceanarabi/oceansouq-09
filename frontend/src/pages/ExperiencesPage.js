import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const ExperiencesPage = () => {
  const [experiences, setExperiences] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const fetchData = async () => {
    try {
      const [typesRes, expRes] = await Promise.all([
        axios.get(`${API_URL}/api/experiences/types`),
        axios.get(`${API_URL}/api/experiences/`, { params: { type: selectedType || undefined } })
      ]);
      setTypes(typesRes.data || []);
      setExperiences(expRes.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-bounce text-6xl">🎭</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🎭 التجارب والأنشطة</h1>
          <p className="text-lg text-white/90">اكتشف أفضل التجارب والمغامرات في السعودية</p>
        </div>
      </div>

      {/* Types Filter */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedType('')}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition
              ${!selectedType ? 'bg-pink-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
          >
            الكل
          </button>
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition flex items-center gap-2
                ${selectedType === type.id ? 'bg-pink-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
            >
              <span>{type.icon}</span>
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="container mx-auto px-4 pb-12">
        {experiences.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center">
            <span className="text-6xl block mb-4">🎭</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">لا توجد تجارب حالياً</h3>
            <p className="text-gray-500">ترقبوا تجارب جديدة قريباً!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <div key={exp.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition group cursor-pointer">
                <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-gray-700 dark:to-gray-600 relative">
                  {exp.images?.[0] ? (
                    <img src={exp.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">🏔️</div>
                  )}
                  {exp.is_featured && (
                    <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">مميز</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{exp.name_ar}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{exp.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span>📍 {exp.city === 'riyadh' ? 'الرياض' : exp.city === 'jeddah' ? 'جدة' : exp.city}</span>
                    <span>⏱️ {exp.duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-500">
                      ⭐ <span className="font-bold">{exp.rating}</span>
                      <span className="text-gray-400 text-xs">({exp.review_count})</span>
                    </div>
                    <div className="text-left">
                      <span className="text-2xl font-bold text-pink-500">{exp.price}</span>
                      <span className="text-gray-500 text-sm"> ر.س/شخص</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">🎯 هل تقدم تجارب أو أنشطة؟</h2>
          <p className="mb-6 text-white/90">انضم إلينا وشارك تجاربك مع الآلاف</p>
          <Link to="/join/experience" className="inline-block bg-white text-pink-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition">
            سجل الآن
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExperiencesPage;
