import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts';

const AnimatedLogo = () => {
  const [showArabic, setShowArabic] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setShowArabic(prev => !prev);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link to="/" className="flex items-center min-w-fit" data-testid="logo">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl ocean-brand transition-all duration-500 hover:scale-105">
        {showArabic && language === 'ar' ? 'المحيط' : 'Ocean'}
      </h1>
    </Link>
  );
};

export default AnimatedLogo;
