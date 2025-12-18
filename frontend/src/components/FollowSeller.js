import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FollowSeller = ({ sellerId, sellerName }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const language = localStorage.getItem('language') || 'en';

  const t = (key) => {
    const translations = {
      en: {
        follow: 'Follow',
        following: 'Following',
        followers: 'followers',
        unfollow: 'Unfollow',
        loginToFollow: 'Login to follow'
      },
      ar: {
        follow: 'متابعة',
        following: 'متابَع',
        followers: 'متابع',
        unfollow: 'إلغاء المتابعة',
        loginToFollow: 'سجل دخول للمتابعة'
      }
    };
    return translations[language]?.[key] || translations['en'][key] || key;
  };

  useEffect(() => {
    fetchFollowStatus();
    fetchFollowersCount();
  }, [sellerId]);

  const fetchFollowStatus = async () => {
    if (!token || !sellerId) return;
    try {
      const res = await axios.get(`${API_URL}/api/sellers/${sellerId}/is-following`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFollowing(res.data.following);
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  };

  const fetchFollowersCount = async () => {
    if (!sellerId) return;
    try {
      const res = await axios.get(`${API_URL}/api/sellers/${sellerId}/followers`);
      setFollowersCount(res.data.followers_count || 0);
    } catch (err) {
      console.error('Error fetching followers:', err);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const handleFollow = async () => {
    if (!token) {
      alert(t('loginToFollow'));
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        await axios.delete(`${API_URL}/api/sellers/${sellerId}/follow`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await axios.post(`${API_URL}/api/sellers/${sellerId}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        // Show success animation
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 relative">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 transform ${
          isFollowing
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-red-100 hover:text-red-600 border-2 border-green-500'
            : 'bg-ocean-600 hover:bg-ocean-700 text-white hover:scale-105'
        } disabled:opacity-50`}
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : isFollowing ? (
          <>
            <span className="text-lg">✓</span>
            <span>{t('following')}</span>
          </>
        ) : (
          <>
            <span className="text-lg">+</span>
            <span>{t('follow')}</span>
          </>
        )}
      </button>
      <div className="flex items-center gap-1">
        <span className="text-lg">👥</span>
        <span className={`font-bold transition-all duration-300 ${showSuccess ? 'text-green-500 scale-125' : 'text-gray-600 dark:text-gray-400'}`}>
          {followersCount.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{t('followers')}</span>
      </div>
      {/* Success Animation */}
      {showSuccess && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm animate-bounce">
          ✓ {language === 'ar' ? 'تمت المتابعة!' : 'Followed!'}
        </div>
      )}
    </div>
  );
};

export default FollowSeller;
