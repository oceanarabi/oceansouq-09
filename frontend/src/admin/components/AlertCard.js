import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

const AlertCard = ({ alerts }) => {
  const { t, language } = useAdmin();

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      case 'success': return CheckCircle;
      default: return Info;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'error': return 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400';
      case 'success': return 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400';
      default: return 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400';
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
      low: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
    };
    return colors[priority] || colors.medium;
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('systemAlerts')}</h3>
        <div className="text-center py-8 text-slate-500">
          <CheckCircle className="mx-auto mb-2" size={40} />
          <p>{language === 'ar' ? 'لا توجد تنبيهات' : 'No alerts'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">{t('systemAlerts')}</h3>
      <div className="space-y-3">
        {alerts.map((alert, idx) => {
          const Icon = getIcon(alert.type);
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-4 rounded-xl border ${getColors(alert.type)}`}
            >
              <Icon size={20} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {language === 'ar' ? alert.title_ar : alert.title}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(alert.priority)}`}>
                    {alert.priority}
                  </span>
                </div>
                <p className="text-sm mt-1 opacity-80">
                  {language === 'ar' ? alert.message_ar : alert.message}
                </p>
              </div>
            </div>
          );
        })}      </div>
    </div>
  );
};

export default AlertCard;
