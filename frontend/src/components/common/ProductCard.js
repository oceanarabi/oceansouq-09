import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart, useWishlist, useLanguage, useAuth } from '../../contexts';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ProductCard = ({ product, showBadge = true }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const [showAddAnimation, setShowAddAnimation] = useState(false);
  const { token } = useAuth();
  
  // Determine badge type
  const getBadge = () => {
    if (product.discount_percent) {
      return { text: `-${product.discount_percent}%`, color: 'bg-red-600', label: 'SALE' };
    }
    if (product.isNew) {
      return { text: 'NEW', color: 'bg-green-600', label: 'NEW' };
    }
    if (product.isHot) {
      return { text: 'HOT', color: 'bg-orange-600', label: 'HOT' };
    }
    return null;
  };
  
  const badge = showBadge ? getBadge() : null;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const success = await addToCart(product.id);
    if (success) {
      setShowAddAnimation(true);
      // Award loyalty points
      if (token) {
        axios.post(`${API_URL}/api/loyalty/add-points?points_to_add=10`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.error(err));
      }
      setTimeout(() => setShowAddAnimation(false), 2000);
    }
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    await addToCart(product.id);
    navigate('/cart');
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="product-card-mobile bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-md overflow-hidden cursor-pointer group relative active:scale-[0.98] transition-transform"
      data-testid={`product-card-${product.id}`}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute top-2 md:top-3 left-2 md:left-3 z-10 ${badge.color} text-white px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-bold shadow-lg`}>
          {badge.text}
        </div>
      )}
      
      {/* Wishlist Button - Touch Optimized */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-2 md:top-3 right-2 md:right-3 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
          inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        } shadow-md active:scale-95 transition`}
        data-testid={`wishlist-btn-${product.id}`}
      >
        {inWishlist ? '❤️' : '🤍'}
      </button>

      {/* Product Image - Responsive Height */}
      <div className="relative h-40 sm:h-48 md:h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onLoad={(e) => e.target.classList.remove('skeleton')}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-sm md:text-lg font-bold">{t('outOfStock')}</span>
          </div>
        )}
      </div>

      {/* Product Info - Mobile Optimized */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-sm md:text-lg mb-1 md:mb-2 line-clamp-2 text-gray-900 dark:text-white leading-tight" data-testid={`product-title-${product.id}`}>
          {product.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mb-2 md:mb-3 line-clamp-1 md:line-clamp-2 hidden sm:block">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-lg md:text-2xl font-bold text-ocean-600" data-testid={`product-price-${product.id}`}>
                ${product.price}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs md:text-sm line-through text-gray-400">${product.original_price}</span>
              )}
            </div>
            {product.discount_percent && (
              <span className="text-[10px] md:text-xs text-red-600 font-semibold">
                Save ${(product.original_price - product.price).toFixed(2)}
              </span>
            )}
          </div>
          <span className="text-[10px] md:text-xs bg-ocean-100 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-400 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
            {product.category}
          </span>
        </div>

        {/* Action Buttons - Touch Optimized */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-ocean-600 hover:bg-ocean-700 active:bg-ocean-800 text-white py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition relative min-h-[40px]"
            data-testid={`add-cart-btn-${product.id}`}
          >
            {showAddAnimation ? (
              <span className="animate-bounce">{t('addedToCartAnimation')}</span>
            ) : (
              t('addToCart')
            )}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition min-h-[40px]"
            data-testid={`buy-now-btn-${product.id}`}
          >
            {t('buyNow')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
