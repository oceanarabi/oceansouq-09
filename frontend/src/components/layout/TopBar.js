import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts';

const TopBar = () => {
  const { t, language, switchLanguage } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-ocean-200 dark:border-gray-700 text-sm py-2 md:py-3" style={{ paddingTop: 'calc(8px + env(safe-area-inset-top, 0px))' }}>
      <div className="container mx-auto px-3 md:px-4 flex justify-between items-center">
        {/* Left Side - Help & Track */}
        <div className="flex items-center space-x-3 md:space-x-6 rtl:space-x-reverse">
          <Link to="/help" className="text-ocean-600 hover:text-ocean-700 font-medium text-xs md:text-sm flex items-center gap-1" data-testid="help-link">
            <span>📞</span>
            <span className="hidden sm:inline">{t('help')}</span>
          </Link>
          <Link to="/track-order" className="text-ocean-600 hover:text-ocean-700 font-medium text-xs md:text-sm flex items-center gap-1" data-testid="track-order-link">
            <span>📦</span>
            <span className="hidden sm:inline">{t('trackOrder')}</span>
          </Link>
        </div>
        {/* Right Side - Language Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 border-2 border-ocean-200 dark:border-gray-600 rounded-full px-2 py-0.5 md:px-3 md:py-1">
            <button
              onClick={() => switchLanguage('en')}
              className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold transition ${
                language === 'en' 
                  ? 'bg-ocean-500 text-white' 
                  : 'text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-gray-800'
              }`}
              data-testid="lang-en"
            >
              EN
            </button>
            <button
              onClick={() => switchLanguage('ar')}
              className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold transition ${
                language === 'ar' 
                  ? 'bg-ocean-500 text-white' 
                  : 'text-ocean-600 dark:text-ocean-400 hover:bg-ocean-50 dark:hover:bg-gray-800'
              }`}
              data-testid="lang-ar"
            >
              العربية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
