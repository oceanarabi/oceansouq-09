import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AICenter = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('commandToken');

  const aiModules = [
    { id: 'assistant', name: 'المساعد الشخصي', icon: '🤖', color: 'ocean', description: 'مساعد ذكي لإدارة المنصة' },
    { id: 'analytics', name: 'تحليلات AI', icon: '📊', color: 'purple', description: 'تحليلات تنبؤية وتقارير ذكية' },
    { id: 'automation', name: 'الأتمتة', icon: '⚙️', color: 'green', description: 'أتمتة المهام المتكررة' },
    { id: 'recommendations', name: 'التوصيات', icon: '💡', color: 'yellow', description: 'توصيات ذكية للأعمال' },
    { id: 'content', name: 'توليد المحتوى', icon: '✍️', color: 'pink', description: 'إنشاء محتوى تلقائي' },
    { id: 'support', name: 'الدعم الذكي', icon: '💬', color: 'blue', description: 'دعم فني آلي' },
  ];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'ai',
        text: 'مرحباً! 👋 أنا مساعد Ocean الذكي. يمكنني مساعدتك في:\n\n• تحليل أداء المنصة\n• إنشاء تقارير مفصلة\n• اقتراحات لتحسين الأعمال\n• أتمتة المهام\n\nكيف يمكنني مساعدتك اليوم؟',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: input.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/command/ai/chat`, {
        message: input.trim(),
        context: 'admin_dashboard'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: res.data.response,
        timestamp: new Date()
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      }]);
    }
    setLoading(false);
  };

  const quickActions = [
    { text: 'أعطني ملخص الأداء اليومي', icon: '📊' },
    { text: 'ما هي الخدمات الأكثر نشاطاً؟', icon: '📈' },
    { text: 'اقترح طرق لزيادة المبيعات', icon: '💡' },
    { text: 'أنشئ تقرير أسبوعي', icon: '📄' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <span>🧠</span> مركز الذكاء الاصطناعي
        </h1>
        <p className="text-gray-600 dark:text-gray-400">محركات AI متقدمة لإدارة وتحسين جميع الخدمات</p>
      </div>

      {/* AI Modules Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {aiModules.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveTab(module.id)}
            className={`p-4 rounded-xl transition text-center ${
              activeTab === module.id
                ? 'bg-ocean-600 text-white shadow-lg scale-105'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-3xl block mb-2">{module.icon}</span>
            <span className="text-sm font-semibold">{module.name}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Chat */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: '600px' }}>
          <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h2 className="font-bold">مساعد Ocean الذكي</h2>
                <p className="text-sm text-white/80">JARVIS - مساعدك الشخصي للإدارة</p>
              </div>
              <span className="mr-auto w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-ocean-500 text-white rounded-br-sm'
                    : 'bg-white dark:bg-gray-800 shadow rounded-bl-sm'
                }`}>
                  {msg.type === 'ai' && <span className="text-xl ml-2">🤖</span>}
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-ocean-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-ocean-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-ocean-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setInput(action.text); }}
                    className="text-xs bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600 px-3 py-2 rounded-full hover:bg-ocean-200 transition"
                  >
                    {action.icon} {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="اكتب رسالتك أو أمرك..."
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:text-white"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 transition"
              >
                ➔
              </button>
            </div>
          </div>
        </div>

        {/* AI Stats */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">إحصائيات AI</h3>
            <div className="space-y-4">
              {[
                { label: 'المحادثات اليوم', value: '245', icon: '💬' },
                { label: 'المهام المؤتمتة', value: '89', icon: '⚙️' },
                { label: 'التوصيات المقدمة', value: '34', icon: '💡' },
                { label: 'التقارير المولدة', value: '12', icon: '📄' },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{stat.icon}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <h3 className="font-bold mb-2">🚀 تحسين مقترح</h3>
            <p className="text-sm text-white/80 mb-4">بناءً على التحليلات، يمكن زيادة المبيعات بنسبة 15% بتفعيل التوصيات الذكية</p>
            <button className="w-full bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-semibold transition">
              عرض التفاصيل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICenter;
