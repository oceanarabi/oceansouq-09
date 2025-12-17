import React from 'react';
import { useAdmin } from '../contexts/AdminContext';

const Icons = {
  AlertTriangle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  Info: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  XCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const AlertCard = ({ alerts }) => {
  const { t, language } = useAdmin();

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return Icons.AlertTriangle;
      case 'error': return Icons.XCircle;
      case 'success': return Icons.CheckCircle;
      default: return Icons.Info;
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
          <div className="mx-auto mb-2 w-10 h-10 flex items-center justify-center">
            <Icons.CheckCircle />
          </div>
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
              <div className="mt-0.5 flex-shrink-0">
                <Icon />
              </div>
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
        })}
      </div>
    </div>
  );
};

export default AlertCard;
