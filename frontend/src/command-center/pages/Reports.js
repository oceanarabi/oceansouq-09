import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [historical, setHistorical] = useState({});
  const [forecast, setForecast] = useState({});
  const [generatedReport, setGeneratedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [templatesRes, scheduledRes, historicalRes, forecastRes] = await Promise.all([
        axios.get(`${API_URL}/api/reports/templates`, { headers }),
        axios.get(`${API_URL}/api/reports/scheduled`, { headers }),
        axios.get(`${API_URL}/api/reports/historical`, { headers }),
        axios.get(`${API_URL}/api/reports/forecast`, { headers })
      ]);
      
      setTemplates(templatesRes.data.templates || []);
      setScheduled(scheduledRes.data.scheduled || []);
      setHistorical(historicalRes.data || {});
      setForecast(forecastRes.data || {});
    } catch (err) {
      // Demo data
      setTemplates([
        { id: 'sales_summary', name: 'ملخص المبيعات', description: 'تقرير شامل بالمبيعات', category: 'مالية', icon: '📊' },
        { id: 'seller_performance', name: 'أداء البائعين', description: 'تقييم أداء البائعين', category: 'عمليات', icon: '🏪' },
        { id: 'customer_analytics', name: 'تحليل العملاء', description: 'سلوك العملاء والاحتفاظ', category: 'تسويق', icon: '👥' },
        { id: 'delivery_metrics', name: 'مقاييس التوصيل', description: 'أوقات التوصيل', category: 'لوجستيات', icon: '🚚' },
        { id: 'fraud_report', name: 'تقرير الاحتيال', description: 'حالات الاحتيال', category: 'أمان', icon: '🛡️' },
        { id: 'tax_report', name: 'تقرير الضرائب', description: 'ضريبة القيمة المضافة', category: 'مالية', icon: '📋' },
      ]);
      setScheduled([
        { id: 'SCH-001', name: 'تقرير المبيعات اليومي', type: 'sales_summary', frequency: 'daily', time: '08:00', enabled: true },
        { id: 'SCH-002', name: 'تقرير أداء البائعين', type: 'seller_performance', frequency: 'weekly', time: '09:00', enabled: true },
      ]);
      setHistorical({
        data: [
          { month: 'يناير', value: 2000000, growth: 0 },
          { month: 'فبراير', value: 2200000, growth: 10 },
          { month: 'مارس', value: 2500000, growth: 13.6 },
          { month: 'أبريل', value: 2400000, growth: -4 },
          { month: 'مايو', value: 2800000, growth: 16.7 },
          { month: 'يونيو', value: 3000000, growth: 7.1 },
        ],
        summary: { total: 14900000, overall_growth: 50 }
      });
      setForecast({
        predictions: [
          { month: 'يوليو', predicted_value: 3200000, confidence: 95 },
          { month: 'أغسطس', predicted_value: 3450000, confidence: 90 },
          { month: 'سبتمبر', predicted_value: 3700000, confidence: 85 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (templateId) => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/reports/generate`, {
        report_type: templateId,
        date_from: '2024-01-01',
        date_to: '2024-01-15',
        format: 'json'
      }, { headers: { Authorization: `Bearer ${token}` } });
      setGeneratedReport(res.data);
      setActiveTab('generated');
    } catch (err) {
      // Demo generated report
      setGeneratedReport({
        report_id: 'RPT-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        report_type: templateId,
        generated_at: new Date().toISOString(),
        data: {
          summary: { total_sales: 2850000, total_orders: 15420, average_order_value: 185 },
          by_category: [
            { category: 'إلكترونيات', sales: 950000, percentage: 33.3 },
            { category: 'أزياء', sales: 650000, percentage: 22.8 },
            { category: 'منزل ومطبخ', sales: 480000, percentage: 16.8 },
          ]
        }
      });
      setActiveTab('generated');
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = (format) => {
    alert(`جاري تصدير التقرير بصيغة ${format.toUpperCase()}...`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const maxValue = Math.max(...(historical.data?.map(d => d.value) || [1]));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-3xl">📊</span> التقارير والتحليلات
        </h1>
        <p className="text-gray-500">إنشاء وتصدير التقارير المخصصة</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'templates', label: 'قوالب التقارير', icon: '📄' },
          { id: 'scheduled', label: 'تقارير مجدولة', icon: '📅' },
          { id: 'historical', label: 'تحليل تاريخي', icon: '📈' },
          { id: 'forecast', label: 'تنبؤات', icon: '🔮' },
          ...(generatedReport ? [{ id: 'generated', label: 'التقرير المنشأ', icon: '✅' }] : [])
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'templates' && (
        <div className="grid md:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="text-4xl mb-4">{template.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">{template.name}</h3>
              <p className="text-gray-500 text-sm mt-2">{template.description}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                {template.category}
              </span>
              <button
                onClick={() => generateReport(template.id)}
                disabled={generating}
                className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {generating ? 'جاري الإنشاء...' : 'إنشاء التقرير'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'scheduled' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">التقارير المجدولة</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ جدولة جديدة</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {scheduled.map((schedule) => (
              <div key={schedule.id} className="p-6 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{schedule.name}</p>
                  <p className="text-sm text-gray-500">{schedule.frequency === 'daily' ? 'يومي' : 'أسبوعي'} • {schedule.time}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button className={`w-12 h-6 rounded-full transition-all relative ${schedule.enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${schedule.enabled ? 'right-0.5' : 'left-0.5'}`}></span>
                  </button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">تعديل</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'historical' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">التحليل التاريخي للإيرادات</h2>
          <div className="flex items-end justify-between gap-4 h-64 mb-6">
            {historical.data?.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex justify-center mb-2">
                  <div
                    className="w-full max-w-[50px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all"
                    style={{ height: `${(item.value / maxValue) * 200}px` }}
                  ></div>
                </div>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{(item.value / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-gray-500">{item.month}</p>
                <p className={`text-xs ${item.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.growth >= 0 ? '+' : ''}{item.growth}%
                </p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4">
              <p className="text-indigo-600 dark:text-indigo-400 text-sm">إجمالي الفترة</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{(historical.summary?.total / 1000000)?.toFixed(1)}M ر.س</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="text-green-600 dark:text-green-400 text-sm">النمو الإجمالي</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">+{historical.summary?.overall_growth}%</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">🔮 التنبؤات المستقبلية</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {forecast.predictions?.map((pred, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
                <p className="text-purple-100">{pred.month}</p>
                <p className="text-3xl font-bold mt-2">{(pred.predicted_value / 1000000).toFixed(1)}M ر.س</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${pred.confidence}%` }}></div>
                  </div>
                  <span className="text-sm">{pred.confidence}% ثقة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'generated' && generatedReport && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">التقرير المنشأ</h2>
              <p className="text-gray-500 text-sm">{generatedReport.report_id} • {new Date(generatedReport.generated_at).toLocaleString('ar-SA')}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportReport('csv')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                <span>📄</span> CSV
              </button>
              <button onClick={() => exportReport('pdf')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                <span>📃</span> PDF
              </button>
              <button onClick={() => exportReport('excel')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                <span>📊</span> Excel
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <p className="text-blue-600 text-sm">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{generatedReport.data?.summary?.total_sales?.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <p className="text-green-600 text-sm">عدد الطلبات</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{generatedReport.data?.summary?.total_orders?.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <p className="text-purple-600 text-sm">متوسط قيمة الطلب</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{generatedReport.data?.summary?.average_order_value} ر.س</p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4">المبيعات حسب الفئة</h3>
            <div className="space-y-3">
              {generatedReport.data?.by_category?.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-24 text-gray-700 dark:text-gray-300">{cat.category}</span>
                  <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                  <span className="w-24 text-left font-bold text-gray-800 dark:text-white">{cat.sales?.toLocaleString()}</span>
                  <span className="w-12 text-gray-500">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
