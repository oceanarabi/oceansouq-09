import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('customerService')}</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-400 hover:text-white">{t('helpCenter')}</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-white">{t('returns')}</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-white">{t('shippingInfo')}</Link></li>
              <li><Link to="/track" className="text-gray-400 hover:text-white">{t('trackMyOrder')}</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('aboutUs')}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">{t('aboutUs')}</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white">{t('careers')}</Link></li>
              <li><Link to="/become-seller" className="text-green-400 hover:text-green-300 font-semibold">💼 Become a Seller</Link></li>
              <li><Link to="/affiliate" className="text-gray-400 hover:text-white">{t('affiliateProgram')}</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">{t('privacyPolicy')}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('category')}</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=Electronics" className="text-gray-400 hover:text-white">{t('electronics')}</Link></li>
              <li><Link to="/products?category=Fashion" className="text-gray-400 hover:text-white">{t('mensFashion')}</Link></li>
              <li><Link to="/products?category=Beauty" className="text-gray-400 hover:text-white">{t('beautyPersonalCare')}</Link></li>
              <li><Link to="/products?category=Home" className="text-gray-400 hover:text-white">{t('homeKitchen')}</Link></li>
            </ul>
          </div>

          {/* Social & Payment */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t('followUs')}</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-2xl hover:text-ocean-400">📘</a>
              <a href="#" className="text-2xl hover:text-ocean-400">📷</a>
              <a href="#" className="text-2xl hover:text-ocean-400">🐦</a>
            </div>
            <h3 className="font-bold text-lg mb-4">{t('paymentMethods')}</h3>
            <div className="flex flex-wrap gap-2">
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Stripe</div>
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Apple Pay</div>
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Tabby</div>
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Tamara</div>
              <div className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-semibold">Mada</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2025 Ocean. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
