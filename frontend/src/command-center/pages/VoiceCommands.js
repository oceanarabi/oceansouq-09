import React, { useState, useEffect } from 'react';

const VoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [supportedCommands, setSupportedCommands] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchSupportedCommands();
    fetchHistory();
  }, []);

  const fetchSupportedCommands = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/voice/supported-commands?language=ar`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSupportedCommands(data.commands || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/voice/history?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const processCommand = async () => {
    if (!command.trim()) return;
    
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/api/voice/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: command, language: 'ar' })
      });
      const data = await res.json();
      setResponse(data);
      fetchHistory();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    setIsListening(true);
    // Simulate listening - in production would use Web Speech API or Whisper
    setTimeout(() => {
      setIsListening(false);
      setCommand('أرني مبيعات اليوم');
    }, 2000);
  };

  const quickCommands = [
    { text: 'أرني المبيعات', icon: '💰' },
    { text: 'كم طلب جديد', icon: '📦' },
    { text: 'السائقين المتاحين', icon: '🚗' },
    { text: 'هل يوجد تنبيهات', icon: '🚨' },
    { text: 'حالة المخزون', icon: '📋' },
    { text: 'كيف الأداء', icon: '📊' }
  ];

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎙️ الأوامر الصوتية</h1>
        <p className="text-gray-400">تحكم بالنظام عبر الصوت</p>
      </div>

      {/* Main Voice Interface */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-2xl p-8 mb-6">
          {/* Microphone Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={startListening}
              disabled={isListening}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-600 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <span className="text-5xl">{isListening ? '🟢' : '🎙️'}</span>
            </button>
          </div>
          
          <p className="text-center text-gray-400 mb-4">
            {isListening ? 'جاري الاستماع...' : 'اضغط على الميكروفون للتحدث'}
          </p>

          {/* Text Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && processCommand()}
              placeholder="اكتب أمرك هنا..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={processCommand}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
            >
              {loading ? 'جاري...' : 'إرسال'}
            </button>
          </div>
        </div>

        {/* Response */}
        {response && (
          <div className={`bg-gray-800 rounded-xl p-6 mb-6 border-r-4 ${response.success ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex items-start gap-4">
              <span className="text-4xl">
                {response.intent === 'sales' ? '💰' :
                 response.intent === 'orders' ? '📦' :
                 response.intent === 'drivers' ? '🚗' :
                 response.intent === 'alerts' ? '🚨' :
                 response.intent === 'inventory' ? '📋' :
                 response.intent === 'performance' ? '📊' :
                 response.intent === 'help' ? '❓' : '🤖'}
              </span>
              <div>
                <p className="text-lg mb-2">{response.response_text}</p>
                {response.data && (
                  <div className="bg-gray-700 rounded-lg p-4 mt-3">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Commands */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold mb-4">⚡ أوامر سريعة</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => { setCommand(cmd.text); processCommand(); }}
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg text-sm flex items-center gap-2 transition-all"
              >
                <span>{cmd.icon}</span>
                <span>{cmd.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Supported Commands */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h3 className="font-bold mb-4">📖 الأوامر المدعومة</h3>
          <div className="space-y-3">
            {supportedCommands.map((cmd, idx) => (
              <div key={idx} className="bg-gray-700 p-3 rounded-lg">
                <div className="font-bold text-blue-400">{cmd.description}</div>
                <div className="text-sm text-gray-400 mt-1">
                  أمثلة: {cmd.examples?.slice(0, 3).join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="font-bold mb-4">📜 السجل</h3>
          <div className="space-y-2">
            {history.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                <span>{item.command}</span>
                <span className={`px-2 py-1 rounded text-xs ${item.success ? 'bg-green-600' : 'bg-red-600'}`}>
                  {item.success ? 'ناجح' : 'فشل'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCommands;