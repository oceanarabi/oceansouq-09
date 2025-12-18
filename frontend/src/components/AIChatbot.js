import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const language = localStorage.getItem('language') || 'en';
  const token = localStorage.getItem('token');
  
  // Speech Recognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  
  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'ar' ? 'ar-SA' : 
                       language === 'tr' ? 'tr-TR' : 
                       language === 'de' ? 'de-DE' : 
                       language === 'zh' ? 'zh-CN' : 
                       language === 'fr' ? 'fr-FR' : 'en-US';
  }

  const t = (key) => {
    const translations = {
      en: {
        title: 'Ocean AI Assistant',
        placeholder: 'Type your message...',
        send: 'Send',
        welcome: 'Hi! 👋 I\'m your Ocean shopping assistant. How can I help you today?',
        voiceNotSupported: 'Voice search is not supported in this browser',
        listening: 'Listening...',
        askAnything: 'Ask me anything about products, orders, or shipping!'
      },
      ar: {
        title: 'مساعد Ocean الذكي',
        placeholder: 'اكتب رسالتك...',
        send: 'إرسال',
        welcome: 'مرحباً! 👋 أنا مساعدك الذكي في Ocean. كيف أستطيع مساعدتك اليوم؟',
        voiceNotSupported: 'البحث الصوتي غير مدعوم في هذا المتصفح',
        listening: 'جارٍ الاستماع...',
        askAnything: 'اسألني عن أي شيء - المنتجات، الطلبات، أو الشحن!'
      },
      tr: {
        title: 'Ocean AI Asistanı',
        placeholder: 'Mesajınızı yazın...',
        send: 'Gönder',
        welcome: 'Merhaba! 👋 Ben Ocean alışveriş asistanınızım. Size nasıl yardımcı olabilirim?',
        voiceNotSupported: 'Sesli arama bu tarayıcıda desteklenmiyor',
        listening: 'Dinleniyor...',
        askAnything: 'Ürünler, siparişler veya kargo hakkında her şeyi sorabilirsiniz!'
      },
      de: {
        title: 'Ocean AI Assistent',
        placeholder: 'Nachricht eingeben...',
        send: 'Senden',
        welcome: 'Hallo! 👋 Ich bin Ihr Ocean Shopping-Assistent. Wie kann ich Ihnen helfen?',
        voiceNotSupported: 'Sprachsuche wird nicht unterstützt',
        listening: 'Höre zu...',
        askAnything: 'Fragen Sie mich alles über Produkte, Bestellungen oder Versand!'
      },
      zh: {
        title: 'Ocean AI助手',
        placeholder: '输入您的消息...',
        send: '发送',
        welcome: '你好！👋 我是Ocean购物助手。今天有什么可以帮您的？',
        voiceNotSupported: '此浏览器不支持语音搜索',
        listening: '正在听...',
        askAnything: '随时问我关于产品、订单或运输的任何问题！'
      },
      fr: {
        title: 'Assistant AI Ocean',
        placeholder: 'Tapez votre message...',
        send: 'Envoyer',
        welcome: 'Bonjour! 👋 Je suis votre assistant shopping Ocean. Comment puis-je vous aider?',
        voiceNotSupported: 'La recherche vocale n\'est pas supportée',
        listening: 'Écoute en cours...',
        askAnything: 'Posez-moi des questions sur les produits, commandes ou livraison!'
      }
    };
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        type: 'ai',
        text: t('welcome'),
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text = inputText) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message: text.trim(),
        session_id: sessionId,
        language: language
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: language === 'ar' ? 'عذراً، حدث خطأ. حاول مرة أخرى.' : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date()
      }]);
    }

    setIsLoading(false);
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      alert(t('voiceNotSupported'));
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
      // Auto-send after voice input
      setTimeout(() => sendMessage(transcript), 500);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    language === 'ar' ? 'ما سياسة الإرجاع؟' : 'Return policy?',
    language === 'ar' ? 'كيف أتتبع طلبي؟' : 'Track my order',
    language === 'ar' ? 'أوصني بمنتجات' : 'Recommend products'
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90' : 'bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700'
        }`}
        style={{ boxShadow: '0 4px 20px rgba(0, 102, 204, 0.4)' }}
      >
        {isOpen ? (
          <span className="text-white text-3xl">✕</span>
        ) : (
          <span className="text-3xl">🤖</span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-24 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            language === 'ar' ? 'left-6' : 'right-6'
          }`}
          style={{ 
            width: '380px', 
            height: '520px',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 150px)'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{t('title')}</h3>
              <p className="text-xs text-white/80">Powered by AI ✨</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.type === 'user'
                      ? 'bg-ocean-500 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-md rounded-bl-sm'
                  }`}
                >
                  {msg.type === 'ai' && (
                    <span className="text-lg mr-2">🤖</span>
                  )}
                  <span className="text-sm leading-relaxed">{msg.text}</span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-bl-sm shadow-md">
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

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
              <p className="text-xs text-gray-500 mb-2">{t('askAnything')}</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-ocean-100 dark:bg-ocean-900/30 text-ocean-600 dark:text-ocean-400 px-3 py-1.5 rounded-full hover:bg-ocean-200 dark:hover:bg-ocean-900/50 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
            <div className="flex items-center gap-2">
              {/* Voice Button */}
              <button
                onClick={handleVoiceInput}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={isListening ? t('listening') : 'Voice input'}
              >
                {isListening ? '🔴' : '🎤'}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? t('listening') : t('placeholder')}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:text-white"
                disabled={isListening}
              />

              {/* Send Button */}
              <button
                onClick={() => sendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 bg-ocean-500 hover:bg-ocean-600 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
